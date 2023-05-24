#pragma once

#include <eosiolib/contract.hpp>
#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>
#include <eosiolib/symbol.hpp>

#include <math.h>
#include <eosiolib/crypto.h>

#include <string>

using namespace eosio;
using eosio::contract;
using eosio::multi_index;
using eosio::print;

#define TOKEN_MAX_SUPPLY        2100000000000000000LL
#define TOKEN_SYMBOL_CODE       "PKDAD"
#define TOKEN_SYMBOL_PRECISION  4
#define TOKEN_SYMBOL            ::eosio::symbol(TOKEN_SYMBOL_CODE, TOKEN_SYMBOL_PRECISION)

namespace eosiosystem
{
class system_contract;
}

namespace pokerchndadv
{

using std::string;

class[[eosio::contract("pokerchndadv")]] token : public contract
{
 public:
   using contract::contract;

   [[eosio::action]] void init(name wallet);

   [[eosio::action]] void burn(asset quantity, string memo);

   [[eosio::action]] void pause();
   [[eosio::action]] void unpause();

   [[eosio::action]] void transfer(name from,
                                   name to,
                                   asset quantity,
                                   string memo);

   [[eosio::action]] void close(name owner, const symbol &symbol);

   static asset get_supply(name token_contract_account, symbol_code sym_code)
   {
      stats statstable(token_contract_account, sym_code.raw());
      const auto &st = statstable.get(sym_code.raw());
      return st.supply;
   }

   static asset get_balance(name token_contract_account, name owner, symbol_code sym_code)
   {
      accounts accountstable(token_contract_account, owner.value);
      const auto &ac = accountstable.get(sym_code.raw());
      return ac.balance;
   }

 private:
   struct [[eosio::table]] account
   {
      asset balance;

      uint64_t primary_key() const { return balance.symbol.code().raw(); }
   };

   struct [[eosio::table]] currency_stats
   {
      asset supply;
      asset max_supply;
      name issuer;

      uint64_t primary_key() const { return supply.symbol.code().raw(); }
   };

   struct [[eosio::table]] pause_table
   {
      uint64_t id;
      bool paused;
      uint64_t primary_key() const { return id; }
   };

   typedef eosio::multi_index<"accounts"_n, account> accounts;
   typedef eosio::multi_index<"stat"_n, currency_stats> stats;
   typedef eosio::multi_index<"pausetable"_n, pause_table> pausetable;

   void sub_balance(name owner, asset value);
   void add_balance(name owner, asset value, name ram_payer);

   bool is_paused();

   static uint64_t _hash(string key)
   {
      capi_checksum256 result;
      sha256(&key[0], key.size(), &result);
      uint64_t my_hash = 0;
      for (char i = 0; i < 8; i++)
      {
         my_hash = my_hash + pow(10, i) * result.hash[i];
      }
      return my_hash;
   }
};

} // namespace pokerchndadv
