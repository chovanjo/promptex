# Category, transaction type & disposition

## Property category (Kategorie) — `category_main_cb`
- **Type:** enum (required for any meaningful search)
- **Applies to:** all

| Code | English | Czech |
|---|---|---|
| 1 | Apartments | Byty |
| 2 | Houses | Domy |
| 3 | Land | Pozemky |
| 4 | Commercial | Komerční |
| 5 | Other | Ostatní |

## Transaction type (Typ nabídky) — `category_type_cb`
- **Type:** enum
- **Applies to:** all

| Code | English | Czech |
|---|---|---|
| 1 | Sale | Prodej |
| 2 | Rent | Pronájem |
| 3 | Auction | Dražby |
| 4 | Co-ownership share | Podíly |

## Sub-category / disposition (Druh) — `category_sub_cb`
- **Type:** enum — **values depend on `category_main_cb`**
- For apartments these are layouts (1+kk…); for other categories they are property subtypes.

**Apartments (byty):**
| Code | Value |
|---|---|
| 2 | 1+kk | 
| 3 | 1+1 |
| 4 | 2+kk |
| 5 | 2+1 |
| 6 | 3+kk |
| 7 | 3+1 |
| 8 | 4+kk |
| 9 | 4+1 |
| 10 | 5+kk |
| 11 | 5+1 |
| 12 | 6 and more (6 a více) |
| 16 | Atypical (Atypický) |

**Houses (domy):** 33 Cottage/chata, 35 Heritage/other (Památka/jiné), 37 Family house (Rodinný),
39 Villa (Vila), 40 Turnkey (Na klíč), 43 Cottage/chalupa, 44 Farmstead (Zemědělská usedlost),
54 Multi-generation house (Vícegenerační dům).

**Land (pozemky):** 18 Commercial (Komerční), 19 Residential (Bydlení), 20 Field (Pole),
21 Forest (Lesy), 22 Meadow (Louky), 23 Garden (Zahrady), 24 Other (Ostatní), 46 Pond (Rybníky),
48 Orchard/vineyard (Sady/vinice).

**Commercial (komerční):** 25 Offices (Kanceláře), 26 Warehouses (Sklady), 27 Production (Výroba),
28 Retail premises (Obchodní prostory), 29 Accommodation (Ubytování), 30 Restaurant (Restaurace),
31 Agricultural (Zemědělský), 32 Other (Ostatní), 38 Apartment building (Činžovní dům),
56 Surgery/clinic (Ordinace), 57 Apartments (Apartmány).

**Other (ostatní):** 34 Garage (Garáž), 36 Other (Ostatní), 50 Wine cellar (Vinný sklep),
51 Attic space (Půdní prostor), 52 Parking space (Garážové stání), 53 Mobile home (Mobilheim).

> Multiple dispositions can be combined (the UI sends several values for `category_sub_cb`).

## Room count (Počet pokojů) — `room_count_cb`
- **Type:** enum
- **Applies to:** Houses (domy) primarily (apartments use `category_sub_cb` layouts instead)

| Code | English | Czech |
|---|---|---|
| 1 | 1 room | 1 pokoj |
| 2 | 2 rooms | 2 pokoje |
| 3 | 3 rooms | 3 pokoje |
| 4 | 4 rooms | 4 pokoje |
| 5 | 5+ rooms | 5 a více pokojů |
| 6 | Atypical | Atypický |

### Examples
```
# 2+kk apartments for sale
/estates/search?category_main_cb=1&category_type_cb=1&category_sub_cb=4
# Villas for sale
/estates/search?category_main_cb=2&category_type_cb=1&category_sub_cb=39
```
