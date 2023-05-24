add_contract(pokerchndadv pokerchndadv ${CMAKE_CURRENT_SOURCE_DIR}/pokerchndadv.cpp)
target_include_directories(pokerchndadv.wasm
   PUBLIC
   ${CMAKE_CURRENT_SOURCE_DIR})

set_target_properties(pokerchndadv.wasm
   PROPERTIES
   RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}")

