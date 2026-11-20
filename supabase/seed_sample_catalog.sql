-- Carolina Cache sample catalog seed
-- Inserts only when a SKU is new; existing product rows and immutable SKUs are never updated.
-- Run after confirming the public.products columns/types in the target Supabase project.

insert into public.products (
  sku, title, description, price, category, condition, stock, status,
  images, section_placement, weight_oz, length_in, width_in, height_in, shipping_tier
)
values
  ('CLT-CARD-1001', '1999 Pokémon Base Set Charizard Holo #4/102 (PSA 8 NM-MT)', 'Iconic Unlimited Holo Charizard encapsulated in an authentic PSA 8 Near Mint-Mint slab. Crisp holofoil shine with clean edges; ships insured in a bubble mailer.', 385.00, 'Trading Cards', 'PSA 8 NM-MT', 1, 'available', array['/images/samples/charizard-psa8.png'], 'Shop', 12, 8, 6, 2, 'Standard Box (1 lb)'),
  ('CLT-CARD-1002', '2023 Panini Prizm Victor Wembanyama Silver Prizm Rookie #136', 'Pack-fresh Silver Prizm rookie card with sharp 55/45 centering and mirror-bright refractor finish. Stored in a magnetic one-touch case.', 245.00, 'Trading Cards', 'Near Mint', 1, 'available', array['/images/samples/wembanyama-silver-prizm.png'], 'Shop', 6, 7, 5, 1, 'Small Mailer (<1 lb)'),
  ('CLT-FIG-1003', 'Star Wars Black Series Boba Fett (Prototype Armor) 6" Figure — MISB', 'Factory-sealed Mint-in-Sealed-Box collector edition featuring crisp window packaging, twin blasters, and removable jetpack. Never opened.', 54.00, 'Action Figures', 'New in Box', 1, 'available', array['/images/samples/boba-fett-prototype.png'], 'Shop', 14, 10, 6, 3, 'Standard Box (1 lb)'),
  ('CLT-FIG-1004', 'Mafex No. 185 Spider-Man (Classic Costume Ver.) 1/12 Import Figure', 'Authentic Medicom Toy Japan import complete with unmasked Peter Parker head sculpt, magnetic wall-crawling hands/feet, and articulated display stand.', 118.00, 'Action Figures', 'Near Mint', 1, 'available', array['/images/samples/classic-web-hero.png'], 'Shop', 16, 9, 7, 4, 'Standard Box (1 lb)'),
  ('CLT-ELEC-1005', 'Nintendo Switch OLED Model (White Joy-Con) + Dock & Pro Case', 'Vibrant 7-inch OLED screen with zero burn-in or scratches. Includes white dock, Joy-Con grip, OEM power adapter, HDMI cable, and hardshell travel case.', 239.00, 'Electronics', 'Used - Like New', 1, 'available', array['/images/samples/oled-console.png'], 'Shop', 42, 14, 10, 5, 'Medium Box (3 lb)'),
  ('CLT-ELEC-1006', 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones — Silver', 'Industry-leading ANC headphones tested for 30-hour battery health and crystal-clear call audio. Includes original collapsible case and USB-C charging cable.', 219.00, 'Electronics', 'Used - Very Good', 1, 'available', array['/images/samples/noise-cancel-headphones.png'], 'Shop', 22, 11, 9, 4, 'Medium Box (2 lb)'),
  ('CLT-COLL-1007', 'LEGO Star Wars Millennium Falcon 75257 Collector Display Set (Complete)', '100% piece-verified display build including Finn, Chewbacca, Lando Calrissian, Boolio, C-3PO, R2-D2, and D-O minifigures plus original instruction manual.', 135.00, 'Collectibles', 'Used - Very Good', 1, 'available', array['/images/samples/space-freighter-set.png'], 'Shop', 68, 22, 15, 4, 'Large Box (5 lb)'),
  ('CLT-COLL-1008', '1996 Original Tamagotchi Gen 1 Translucent Blue — Tested & Working', 'Authentic Bandai 1996 first-generation virtual pet with crisp pixel display, responsive buttons, and intact keychain clip. Fresh LR44 batteries installed.', 48.00, 'Collectibles', 'Used - Very Good', 1, 'available', array['/images/samples/translucent-virtual-pet.png'], 'Shop', 4, 6, 4, 2, 'Small Mailer (<1 lb)')
on conflict do nothing;
