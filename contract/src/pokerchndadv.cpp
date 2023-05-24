#include "pokerchndadv.hpp"
#include <eosiolib/eosio.hpp>

namespace pokerchndadv
{

void token::init(name wallet)
{
   require_auth(_self);

   auto maximum_supply = asset(TOKEN_MAX_SUPPLY, TOKEN_SYMBOL);

   auto sym = maximum_supply.symbol;
   eosio_assert(sym.is_valid(), "invalid symbol name");
   eosio_assert(maximum_supply.is_valid(), "invalid supply");
   eosio_assert(maximum_supply.amount > 0, "max-supply must be positive");

   stats statstable(_self, sym.code().raw());
   auto existing = statstable.find(sym.code().raw());
   eosio_assert(existing == statstable.end(), "token with symbol already exists");

   statstable.emplace(_self, [&](auto &s) {
      s.supply = maximum_supply;
      s.max_supply = maximum_supply;
      s.issuer = wallet;
   });

   add_balance(wallet, maximum_supply, _self);
}

void token::burn(asset quantity, string memo)
{
   eosio_assert(!is_paused(), "contract is paused.");

   auto sym = quantity.symbol;
   eosio_assert(sym.is_valid(), "invalid symbol name");
   eosio_assert(memo.size() <= 256, "memo has more than 256 bytes");

   stats statstable(_self, sym.code().raw());
   auto existing = statstable.find(sym.code().raw());
   eosio_assert(existing != statstable.end(), "token with symbol does not exist");
   const auto &st = *existing;

   require_auth(st.issuer);
   eosio_assert(quantity.is_valid(), "invalid quantity");
   eosio_assert(quantity.amount > 0, "must retire positive quantity");

   eosio_assert(quantity.symbol == st.supply.symbol, "symbol precision mismatch");

   statstable.modify(st, same_payer, [&](auto &s) {
      s.supply -= quantity;
   });

   sub_balance(st.issuer, quantity);
}

void token::transfer(name from,
                     name to,
                     asset quantity,
                     string memo)
{
   eosio_assert(!is_paused(), "contract is paused.");

   eosio_assert(from != to, "cannot transfer to self");
   require_auth(from);
   eosio_assert(is_account(to), "to account does not exist");
   auto sym = quantity.symbol.code();
   stats statstable(_self, sym.raw());
   const auto &st = statstable.get(sym.raw());

   require_recipient(from);
   require_recipient(to);

   eosio_assert(quantity.is_valid(), "invalid quantity");
   eosio_assert(quantity.amount > 0, "must transfer positive quantity");
   eosio_assert(quantity.symbol == st.supply.symbol, "symbol precision mismatch");
   eosio_assert(memo.size() <= 256, "memo has more than 256 bytes");

   auto payer = has_auth(to) ? to : from;

   sub_balance(from, quantity);
   add_balance(to, quantity, payer);
}

void token::sub_balance(name owner, asset value)
{
   accounts from_acnts(_self, owner.value);

   const auto &from = from_acnts.get(value.symbol.code().raw(), "no balance object found");
   eosio_assert(from.balance.amount >= value.amount, "overdrawn balance");

   from_acnts.modify(from, owner, [&](auto &a) {
      a.balance -= value;
   });
}

void token::add_balance(name owner, asset value, name ram_payer)
{
   accounts to_acnts(_self, owner.value);
   auto to = to_acnts.find(value.symbol.code().raw());
   if (to == to_acnts.end())
   {
      to_acnts.emplace(ram_payer, [&](auto &a) {
         a.balance = value;
      });
   }
   else
   {
      to_acnts.modify(to, same_payer, [&](auto &a) {
         a.balance += value;
      });
   }
}

void token::close(name owner, const symbol &symbol)
{
   require_auth(owner);
   accounts acnts(_self, owner.value);
   auto it = acnts.find(symbol.code().raw());
   eosio_assert(it != acnts.end(), "Balance row already deleted or never existed. Action won't have any effect.");
   eosio_assert(it->balance.amount == 0, "Cannot close because the balance is not zero.");
   acnts.erase(it);
}

void token::pause()
{
   require_auth(_self);

   pausetable pauset(_self, _self.value);
   auto itr = pauset.find(1);
   if (itr != pauset.end())
   {
      pauset.modify(itr, _self, [&](auto &p) {
         p.paused = true;
      });
   }
   else
   {
      pauset.emplace(_self, [&](auto &p) {
         p.id = 1;
         p.paused = true;
      });
   }
}

void token::unpause()
{
   require_auth(_self);
   pausetable pauset(_self, _self.value);
   while (pauset.begin() != pauset.end())
   {
      auto itr = pauset.end();
      itr--;
      pauset.erase(itr);
      pausetable pauset(_self, _self.value);
   }
}

bool token::is_paused()
{
   pausetable pauset(_self, _self.value);
   bool existing = (pauset.find(1) != pauset.end());
   return existing;
}

} // namespace pokerchndadv

EOSIO_DISPATCH(pokerchndadv::token, (init)(transfer)(close)(burn)(pause)(unpause))
