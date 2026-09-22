/**
 * dishDescriptions.ts
 * Handcrafted authentic culinary descriptions for every item on the Panache menu.
 * Ensures every single dish has a distinct, delicious description and eliminates generic placeholders.
 */

export const DISH_DESCRIPTIONS: Record<string, string> = {
  // ── Breakfast ──────────────────────────────────────────────────
  'Cereals with Milk':
    'Crispy golden cornflakes or nutritious wheat muesli served with your choice of chilled or warm steamed milk and natural honey.',
  'Canned Juice':
    'Chilled refreshing fruit nectar — choice of real Alphonso mango, Valencia orange, Himalayan apple, or mixed fruit.',
  'Pancake':
    'Stack of fluffy, golden-griddled buttermilk pancakes served with whipped butter and pure maple syrup.',
  'Puri Bhaji':
    'Four puffed golden whole-wheat puris served with mildly spiced Hing-tempered potato curry and tangy hill pickle.',
  'Tawa Paratha with Stuffing of Choice (2 pcs)':
    'Pan-crisped whole wheat flatbreads stuffed with spiced aloo, gobhi, or paneer, served with fresh curd and butter.',
  'Tandoori Paratha with Stuffing of Choice (2 pcs)':
    'Clay-oven roasted layered parathas packed with your favorite filling, charred crisp and glazed with farm butter.',
  'Chole Bhature':
    'Slow-simmered Punjabi chickpeas in robust aromatic spices, served with two puffed golden bhaturas and pickled onions.',
  'Poha / Vermicelli Upma / Rawa Choice':
    'Light and fluffy tempered breakfast grains with crunchy peanuts, curry leaves, mustard seeds, and fresh lime.',
  'Cutlet / Aloo Bonda / Bread Pakora / Bread Roll (2 pcs)':
    'Crisp golden fried morning savories filled with seasoned mashed potatoes and herbs, served with mint chutney.',
  'Plain Dosa':
    'Crispy, golden-brown fermented rice and lentil crepe served with steaming vegetable sambar and freshly ground coconut chutney.',
  'Onion / Masala Dosa':
    'Thin crispy crepe stuffed with spiced tempered potato-onion masala, accompanied by fragrant sambar and chutneys.',
  'Paneer / Cheese Dosa':
    'Crisp dosa generously layered with grated fresh cottage cheese or melting cheese, served hot with chutneys.',
  'Utthapam / Idli / Medu Vada':
    'Traditional South Indian platter of fluffy steamed idlis, crispy lentil vadas, or thick savory vegetable utthapams.',

  // ── Eggs ───────────────────────────────────────────────────────
  'Cheese Omelette':
    'Three farm-fresh eggs folded with melting cheddar and mozzarella cheese, served with two slices of buttered toast.',
  'Bread Omelette':
    'Classic highway-style spiced egg omelette enveloping golden toasted bread slices with green chilies and onions.',
  'Boiled Egg (2 pcs)':
    'Two farm-fresh eggs boiled to tender perfection, dusted with pink Himalayan salt and freshly cracked black pepper.',
  'Egg Bhurji':
    'Rustic Indian scrambled eggs tossed with chopped onions, juicy tomatoes, fresh green chilies, and coriander.',
  'Sunny Side Up / Half Fry / Egg Poach (2 pcs)':
    'Gently cooked eggs with soft runny golden yolks and tender whites, served alongside warm buttered toast.',
  'Scrambled Egg (2 pcs)':
    'Soft-curd creamy eggs gently folded with fresh cream and butter, seasoned with white pepper and herbs.',

  // ── Starters - Veg ─────────────────────────────────────────────
  'Chilli Paneer':
    'Crispy wok-tossed cottage cheese cubes with crunchy bell peppers, shallots, garlic, and savory dark soy glaze.',
  'Honey Chilli Potato':
    'Crispy fried potato fingers coated in a sweet and spicy honey-chilli reduction, garnished with toasted sesame seeds.',
  'Cheese Balls':
    'Golden-crumbed croquettes bursting with gooey melted cheese, sweet corn, and Italian herbs.',
  'Crispy Corn':
    'Tender sweet corn kernels fried to a light crunch, seasoned with chaat spices, diced onions, and fresh lemon.',
  'Veg Spring Roll':
    'Crisp golden pastry rolls stuffed with wok-sautéed shredded cabbage, carrots, bell peppers, and ginger.',
  'Veg Kathi Roll':
    'Flaky tawa paratha rolled with seasoned sautéed vegetables, crunchy red onions, and tangy mint-coriander chutney.',
  'Mushroom Tikka':
    'Plump button mushrooms marinated in spiced mustard oil and hung yogurt, charred over glowing tandoor coals.',
  'Paneer Tikka':
    'Thick fresh paneer slabs steeped in Kashmiri deghi mirch and spiced curd, roasted with bell peppers and onions.',
  'Soya Chaap / Soya Malai Chaap':
    'Tender soya chaap skewered and roasted in the tandoor, basted in rich cashew cream or zesty tandoori spices.',

  // ── Starters - Non-Veg ─────────────────────────────────────────
  'Non-Veg Spring Roll':
    'Crisp fried pastry rolls packed with spiced minced chicken, scallions, and Asian aromatics, served with sweet dip.',
  'Non-Veg Kathi Roll':
    'Warm paratha wrapped around succulent grilled chicken tikka, pickled red onions, and mint yogurt drizzle.',
  'Chilli Chicken / Chicken 65':
    'Crispy boneless chicken bites tossed with fresh green chillies, curry leaves, garlic, and fiery oriental sauce.',
  'Chicken Seekh Kabab':
    'Finely minced spiced chicken skewers infused with fresh herbs and roasted garam masala, grilled on iron rods.',
  'Chicken Malai Tikka':
    'Melt-in-mouth chicken morsels marinated in fresh dairy cream, cashew paste, green cardamom, and mild cheese.',
  'Chicken Tikka':
    'Boneless chicken thigh chunks steeped in traditional red tandoori marinade, roasted to smoky perfection.',
  'Bhatti Murg':
    'Smoky bone-in chicken slow-roasted over the rustic charcoal bhatti with crushed whole coriander and spices.',
  'Chicken Haryali Tikka':
    'Tender chicken cubes coated in an aromatic puree of fresh garden mint, coriander, spinach, and green chillies.',

  // ── Soups ──────────────────────────────────────────────────────
  'Cream of Tomato':
    'Velvety ripe plum tomato soup finished with a swirl of fresh dairy cream and crunchy buttered croutons.',
  'Manchow Soup':
    'Spicy Indo-Chinese dark soup infused with minced ginger, garlic, vegetables, and topped with crisp fried noodles.',
  'Dhaniya Shorba':
    'Fragrant clear broth simmered with fresh coriander roots, roasted cumin seeds, and whole hill spices.',
  'Sweet Corn':
    'Comforting creamy soup with sweet American corn kernels, mild seasonal vegetables, and a hint of white pepper.',
  'Minestrone':
    'Hearty Italian countryside soup loaded with diced vegetables, pasta shells, tomatoes, and aromatic oregano.',
  'Chicken Clear Soup':
    'Nutrient-rich clear chicken broth simmered with tender shredded chicken, ginger slivers, and spring onions.',
  'Chicken Coriander Soup':
    'Light aromatic chicken broth infused with crushed coriander leaves, lemon juice, and roasted garlic.',

  // ── Salads ─────────────────────────────────────────────────────
  'Green Salad':
    'Fresh garden-harvested cucumbers, ripe tomatoes, sweet carrots, radish, and red onion rings with lemon wedges.',
  'Russian / Kimchi / Finger Salad':
    'Your choice of chilled diced vegetables in creamy mayonnaise, fiery Korean fermented kimchi, or crisp crudités.',
  'Protein Salad':
    'Wholesome power bowl of sprouted legumes, boiled chickpeas, diced paneer, and mixed greens in lemon-herb dressing.',

  // ── Indian Main - Paneer ───────────────────────────────────────
  'Kadahi Paneer':
    'Fresh cottage cheese tossed in a cast-iron wok with freshly crushed coriander seeds, capsicum, and thick onion-tomato masala.',
  'Shahi Paneer':
    'Velvety, royal preparation of paneer simmered in a creamy white cashew nut and melon seed gravy with cardamom.',
  'Paneer Do Pyaza':
    'Soft paneer cubes cooked with double portions of onions — caramelized onion gravy and crisp shallot petals.',
  'Makhani Paneer':
    'Succulent paneer cubes simmered in a silky, mildly sweet and buttery tomato-cream sauce with fragrant kasuri methi.',
  'Paneer Butter Masala':
    'Paneer chunks immersed in a rich, buttery tomato and onion gravy accented with cream and aromatic spices.',
  'Methi Malai Paneer':
    'Tender paneer bathed in a delicate, mildly spiced cashew cream sauce infused with fresh mountain fenugreek leaves.',
  'Paneer Lababdar':
    'Rich and hearty curry crafted with grated and cubed cottage cheese in a chunky onion-tomato reduction with ginger.',
  'Palak Paneer':
    'Fresh Himalayan spinach blanched and pureed with garlic and cumin, simmered with tender cottage cheese cubes.',
  'Paneer Pasanda':
    'Stuffed paneer parcels shallow-fried and served in a luxurious spiced cashew-almond royal gravy.',
  'Paneer Kofta':
    'Golden melt-in-mouth cottage cheese dumplings stuffed with nuts, simmered in a velvety aromatic curry sauce.',
  'Paneer Bhurji':
    'Crumbled fresh cottage cheese wok-sautéed with diced onions, tomatoes, green chillies, and roasted ground spices.',
  'Paneer Tikka Masala':
    'Smoky tandoori-charred paneer tikka cubes cooked in a vibrant, spiced tomato and bell pepper masala.',

  // ── Seasonal Vegetables ────────────────────────────────────────
  'Bhindi Do Pyaza':
    'Fresh tender ladyfingers sautéed with crunchy onion chunks, amchur (dry mango powder), and toasted hill cumin.',
  'Aloo Jeera':
    'Baby potatoes tossed with generous roasted cumin seeds, turmeric, green chillies, and fresh chopped cilantro.',
  'Aloo Gobhi Adrakhi':
    'Homestyle dry curry of cauliflower florets and potatoes cooked with freshly julienned ginger and warm spices.',
  'Heeng Aloo Beans':
    'Crisp French beans and diced potatoes tempered with aromatic asafoetida (hing) and toasted cumin seeds.',
  'Achari Baigan':
    'Baby eggplants braised in a tangy pickling masala with fennel, nigella seeds, and mustard oil.',
  'Dum Aloo':
    'Baby potatoes slow-cooked in a sealed vessel with a fragrant, velvety Kashmiri spiced yogurt gravy.',
  'Matar Mushroom':
    'Fresh green peas and sliced button mushrooms simmered together in an aromatic homestyle onion-tomato gravy.',
  'Mushroom Butter Masala':
    'Plump button mushrooms enveloped in a rich, buttery tomato reduction with fresh cream and dried fenugreek.',
  'Mushroom Do Pyaza':
    'Mushrooms stir-cooked with double onions, ginger-garlic paste, and roasted coriander in a semi-dry sauce.',
  'Mushroom Masala':
    'Tender button mushrooms simmered with chopped onions, tomatoes, ginger slivers, and whole garam masala.',
  'Vegetable in Sweet and Sour Gravy':
    'Diced seasonal vegetables and pineapple chunks tossed in a vibrant, tangy sweet-and-sour oriental glaze.',
  'Manchurian Gravy':
    'Crisp vegetable dumplings simmered in a savory dark soy, garlic, and scallion sauce.',

  // ── Indian Main - Chicken ──────────────────────────────────────
  'Kadahi Chicken':
    'Bone-in chicken simmered in an iron wok with coarsely ground coriander, chunky capsicum, and thick tomato masala.',
  'Chicken Curry':
    'Traditional homestyle Indian chicken curry slow-cooked on the bone with whole aromatic spices and ginger.',
  'Chicken Masala':
    'Succulent chicken pieces braised in a deeply caramelized onion, tomato, and roasted hill spice gravy.',
  'Kali Mirch Chicken':
    'Tender chicken pieces simmered in a creamy cashew and black pepper gravy with a fragrant aromatic heat.',
  'Chicken Masala Tikka':
    'Smoky tandoori chicken tikka cubes folded into a rich, spicy, tomato and capsicum curry.',
  'Mughlai Chicken':
    'Royal recipe of chicken simmered in a luscious almond-cashew paste with saffron strands and aromatic spices.',
  'Afghani Chicken':
    'Tender chicken steeped in a mild, velvety gravy of beaten curd, cashew cream, and green cardamom.',
  'Butter Chicken':
    'Iconic tandoori-roasted chicken pieces bathed in a silky smooth tomato, dairy butter, and cream makhani sauce.',
  'Handi Chicken':
    'Clay-pot slow-cooked chicken infused with earthy aromas, brown onion paste, and crushed whole spices.',
  'Rogan Josh Chicken':
    'Aromatic Kashmiri chicken preparation infused with Kashmiri red chillies, fennel powder, and dried ginger.',
  'Haryali Chicken':
    'Chicken pieces simmered in a fragrant emerald gravy of fresh garden mint, coriander leaves, and green chillies.',
  'Panache Chicken (Chef Special)':
    'Our Executive Chef\'s signature creation — succulent chicken slow-braised with secret hill spices, nut paste, and cream.',

  // ── Choice of Mutton ───────────────────────────────────────────
  'Panache Mutton (Chef Special)':
    'Signature house specialty of tender prime mutton cuts slow-cooked overnight with whole regional spices and saffron.',
  'Handi Mutton':
    'Tender mutton cuts slow-braised in a sealed earthen pot with crushed garlic, whole spices, and caramelized shallots.',
  'Korma Mutton':
    'Melt-in-mouth goat meat braised with golden fried onions, beaten yogurt, and delicate saffron essence.',
  'Rogan Josh Mutton':
    'Classic Kashmiri delicacy of tender mutton cooked in fragrant spices, ratanjot infusion, and Kashmiri red chili.',
  'Haryali Mutton':
    'Succulent mutton slow-simmered with freshly pureed mint, coriander leaves, and roasted mountain spices.',

  // ── Dal ────────────────────────────────────────────────────────
  'Dal Tadka / Dal Fry':
    'Yellow lentils tempered with pure desi ghee, cumin seeds, minced garlic, dried red chillies, and fresh coriander.',
  'Dal Makhani':
    'Black urad lentils and kidney beans slow-simmered overnight over gentle charcoal embers with cream, butter, and tomatoes.',
  'Dal Sultani':
    'Aristocratic Awadhi yellow lentils smoked with burning charcoal and cloves, finished with milk and saffron.',
  'Dal Panchmeel':
    'Hearty Rajasthani blend of five nutritious lentils tempered with aromatic spices, cumin, and clarified butter.',
  'Rajma Rasila':
    'Mountain red kidney beans slow-simmered in a thick, comforting homestyle ginger-tomato gravy.',

  // ── Mixed Vegetables ───────────────────────────────────────────
  'Mix Veg / Sabz Miloni':
    'Melange of seasonal vegetables, baby corn, and florets cooked with chopped spinach and fragrant gravy.',
  'Veg Jaipuri':
    'Seasonal vegetables cooked in a royal Rajasthani red gravy, topped with crunchy roasted papad strips.',

  // ── Platters ───────────────────────────────────────────────────
  'Veg Platter':
    'Grand assortment of Paneer Tikka, Mushroom Tikka, Soya Malai Chaap, and Veg Spring Rolls with mint chutney.',
  'Non Veg Platter':
    'Chef\'s kebab collection featuring Chicken Tikka, Malai Tikka, Chicken Seekh Kabab, and Bhatti Murg.',

  // ── Breads / Rotis ─────────────────────────────────────────────
  'Tawa Roti':
    'Puffed, homestyle whole-wheat flatbread cooked fresh on an iron griddle.',
  'Butter Tawa Roti':
    'Warm whole-wheat griddle bread generously brushed with pure clarified butter.',
  'Tandoori Roti':
    'Crisp, wholesome whole-wheat flatbread baked against the clay walls of the tandoor.',
  'Butter Tandoori Roti':
    'Crisp clay-oven tandoori roti glazed with rich melting farm butter.',
  'Missi Roti':
    'Nutty gram flour and wheat flatbread seasoned with ajwain, chopped shallots, and dry pomegranate seeds.',
  'Butter Missi Roti':
    'Freshly baked spiced gram flour flatbread crowned with melting butter.',
  'Plain Naan':
    'Soft and pillowy leavened tandoori flatbread baked fresh to order.',
  'Butter Plain Naan':
    'Golden baked leavened naan brushed generously with melted table butter.',
  'Garlic Naan':
    'Tandoori naan topped with aromatic minced garlic and fresh coriander leaves.',
  'Butter Garlic Naan':
    'Fragrant garlic-crusted naan drenched with rich melted butter.',
  'Laccha Paratha':
    'Multi-layered flaky whole-wheat flatbread baked in the tandoor with golden crisp edges.',
  'Butter Chiplets':
    'Portion of chilled premium dairy table butter.',

  // ── Rice & Biryani ─────────────────────────────────────────────
  'Steamed / Jeera Rice':
    'Aromatic long-grain basmati rice steamed plain or tempered with fragrant cumin seeds in pure ghee.',
  'Veg Fried Rice':
    'Wok-tossed basmati rice with finely diced carrots, beans, spring onions, and light soy seasoning.',
  'Butter Onion Rice':
    'Aromatic basmati rice gently tossed with slow-caramelized onions and melted butter.',
  'Peas Pulao':
    'Fragrant basmati pilaf studded with sweet green peas and whole aromatic spices.',
  'Veg Pulao':
    'Basmati rice cooked with assorted garden vegetables, fresh mint, and mild royal spices.',
  'Veg Briyani':
    'Layered basmati rice and marinated seasonal vegetables dum-cooked with saffron, fried onions, and rose water.',
  'Chicken Biryani':
    'Fragrant basmati rice slow dum-cooked with tender spiced chicken, caramelized onions, mint, and saffron.',
  'Mutton Biryani':
    'Traditional kacchi dum biryani with succulent mutton pieces, aromatic spices, and saffron-infused basmati rice.',
  'Chicken Fried Rice':
    'Wok-fried basmati rice with tender shredded chicken, scrambled eggs, scallions, and toasted sesame oil.',
  'Egg Fried Rice':
    'High-flame wok-tossed basmati rice scrambled with fresh farm eggs, onions, and light soy sauce.',
  'Chilli Garlic Fried Rice':
    'Fiery wok-tossed rice flavored with browned garlic, red chillies, and fresh spring onions.',
  'Schezwan Chicken Fried Rice':
    'Spicy Sichuan-style wok rice with shredded chicken, bold red pepper paste, and vegetables.',

  // ── Continental / Italian ──────────────────────────────────────
  'Alfredo Sauce Pasta':
    'Penne or fusilli pasta tossed in a rich, velvety parmesan cheese and garlic cream sauce.',
  'Arrabita Sauce Pasta':
    'Pasta coated in a fiery Italian plum tomato sauce with minced garlic, crushed red chilli flakes, and fresh basil.',
  'Mixed Sauce Pasta':
    'The best of both worlds — pasta tossed in a pink blend of creamy Alfredo and tangy Arrabbiata sauce.',
  'Mushroom Pizza':
    'Crisp 10-inch hand-tossed crust topped with herb tomato sauce, mozzarella, and sautéed garlic mushrooms.',
  'Corn Pizza':
    'Crisp crust topped with sweet golden corn kernels, Italian herbs, and generous bubbling mozzarella.',
  'Plain Pizza':
    'Classic cheese pizza with rich herb-infused tomato marinara and golden bubbly mozzarella.',
  'Paneer Peppery':
    '10-inch pizza topped with spiced paneer cubes, cracked black pepper, capsicum, and melted mozzarella.',
  'Pizza with Topping of Choice':
    'Custom 10-inch hand-stretched pizza baked with your choice of farm toppings and cheese.',
  'Margherita Pizza':
    'Traditional Italian pizza with San Marzano style tomato sauce, fresh mozzarella, and fragrant basil leaves.',

  // ── Kumaoni Pahadi Specialties ─────────────────────────────────
  'Bhat Ki Chudkani / Gahot Ki Dal':
    'Authentic Kumaoni black soybean or horsegram dal slow-simmered in an iron kadahi with local mountain herbs and gandherani.',
  'Mooli Thechuani / Aloo Gutke / Bhat Ke Dupke / Palak Kafa':
    'Traditional Uttarakhand heritage dishes made with crushed mountain radish, tempered potatoes with jamboo, or velvety greens.',
  'Mandua Ki Roti':
    'Nutritious, earthy Pahadi flatbread prepared from locally grown organic finger millet (Ragi).',
  'Boondi Raita':
    'Chilled whipped curd blended with crispy chickpea boondi, roasted cumin powder, and Himalayan black salt.',
  'Kukumber Raita':
    'Cooling curd folded with fresh grated hill cucumber, green chillies, and fresh garden mint.',
  'Kumaoni Raita':
    'Signature Pahadi raita made with strained curd, grated cucumber, and pungent freshly stone-ground yellow mustard (Rai).',
  'Jhungar Ki Kheer':
    'Traditional festive Uttarakhand dessert made by simmering local barnyard millet in thickened milk with cardamom and nuts.',
  'Kumaoni Badi Ki Sabzi':
    'Sun-dried spiced lentil dumplings stewed in a rustic, aromatic hill gravy with mountain spices.',
  'Kumaoni Chicken':
    'Local country-style chicken curry cooked in cold-pressed mustard oil with rustic mountain garlic, wild coriander, and spices.',
  'Kumaoni Mutton':
    'Tender Pahadi goat meat slow-braised with wild hill herbs, stone-ground spices, and garlic cloves.',
  'Plain Khichdi':
    'Gentle, soothing porridge of aromatic rice and yellow moong lentils, served warm and light.',
  'Moong Dal Khichdi':
    'Comforting yellow lentil and rice khichdi tempered with pure desi ghee, cumin, and mild spices.',

  // ── Desserts ───────────────────────────────────────────────────
  'Kesari Kheer / Phirni':
    'Creamy slow-cooked ground rice pudding flavored with saffron strands, green cardamom, and slivered pistachios.',
  'Ice Cream':
    'Two scoops of rich gourmet ice cream — choose from Bourbon Vanilla, Belgian Chocolate, or Alphonso Mango.',
  'Gulab Jamun (2 pcs)':
    'Warm golden fried milk-solid dumplings steeped in fragrant rose and cardamom sugar syrup.',
  'Rasmalai':
    'Soft, spongy cottage cheese discs soaked in chilled, saffron-perfumed evaporated milk with roasted nuts.',
  'Fruit Custard':
    'Chilled velvety vanilla custard loaded with freshly diced seasonal fruits and pomegranate seeds.',
  'Malpua with Rabri / Shahi Tukda':
    'Crisp golden pan-fried sweet pancakes served with thick cardamom rabri, or royal ghee-fried bread pudding.',

  // ── Sandwiches ─────────────────────────────────────────────────
  'Veg Plain Sandwich':
    'Soft white bread triangles layered with cucumber slices, juicy tomatoes, butter, and mild mint spread.',
  'Chicken Plain Sandwich':
    'Tender poached chicken shreds tossed with light mayonnaise and white pepper in soft crustless bread.',
  'Grill / Club Sandwich':
    'Multi-decker toasted sandwich packed with seasoned potato mash, crunchy garden vegetables, and melting cheese.',
  'Chicken Grill Sandwich':
    'Golden toasted sandwich filled with seasoned chicken tikka, melted cheese, and herb spread.',
  'Chocolate Sandwich':
    'Warm toasted bread overflowing with rich, gooey melted dark hazelnut chocolate spread.',
  'Rainbow Sandwich':
    'Vibrant triple-layer sandwich with colorful layers of beetroot, cheese, and fresh mint chutney fillings.',

  // ── Quick Bites & Snacks ───────────────────────────────────────
  'French Fries':
    'Crispy golden potato batons lightly tossed with sea salt, served with tangy tomato dip.',
  'Chilli Cheese Toast':
    'Toasted bread slices baked with melted cheddar, chopped green chillies, and bell peppers.',
  'Paneer Pakoda':
    'Fresh cottage cheese slices stuffed with mint chutney, coated in spiced gram flour and fried crisp.',
  'Chicken Pakoda':
    'Crisp seasoned boneless chicken strips fried in ajwain and gram flour batter, served with spicy dip.',
  'Fish Pakoda':
    'Tender freshwater fish fillets marinated in lemon juice and spices, fried to a light golden crunch.',
  'Masala Maggi':
    'The beloved classic 2-minute noodles cooked with diced onions, tomatoes, butter, and extra tastemaker.',
  'Mix Veg Pakora':
    'Crispy assorted vegetable fritters of onion, potato, and spinach served piping hot with mint chutney.',
  'Egg Maggi':
    'Spiced Masala Maggi noodles wok-tossed with fresh scrambled eggs, green chillies, and butter.',
  'Peanut Masala':
    'Crunchy roasted peanuts tossed with finely chopped onions, tomatoes, green chillies, lime, and chaat masala.',
  'Masala Papad':
    'Crisp roasted tandoori papad topped with a fresh, spicy, and tangy salad of onions, tomatoes, and herbs.',
  'Aloo Chat':
    'Crisp fried potato cubes tossed with sweet tamarind dip, spicy mint chutney, and roasted cumin powder.',
  'Veg Hakka Noodles':
    'Wok-tossed noodles with crunchy julienned cabbage, carrots, bell peppers, and scallions in light soy sauce.',
  'Crispy Chidwa':
    'Lightly roasted flattened rice flakes seasoned with mild hill spices, roasted peanuts, and curry leaves.',
  'Butter Pav Bhaji':
    'Spicy spiced mashed vegetable curry enriched with generous butter, served with two soft toasted pav buns.',
  'Veg Burger':
    'Crispy spiced vegetable patty topped with sliced tomato, cucumber, lettuce, and house burger spread in a toasted bun.',
  'Chicken Burger':
    'Juicy chicken patty grilled with melted cheese, crisp lettuce, and seasoned mayo in a toasted sesame bun.',
  'Paneer / Cheese Burger':
    'Grilled spiced cottage cheese steak with melting cheese, pickled gherkins, and tangy sauce in a toasted bun.',

  // ── Beverages ──────────────────────────────────────────────────
  'Tea':
    'Freshly brewed hill chai — choose from Masala Chai with ginger and cardamom, Green Tea, or Darjeeling Black Tea.',
  'Coffee':
    'Aromatic freshly brewed hot coffee with frothy steamed whole milk.',
  'Cold Coffee':
    'Thick, chilled blended coffee prepared with creamy milk, vanilla ice cream, and chocolate syrup drizzle.',
  'Hot Chocolate':
    'Warm, comforting velvety cocoa beverage topped with a light dusting of cocoa powder.',
  'Lassi Sweet / Salt':
    'Traditional thick churned yogurt drink — served sweet with cardamom essence or savory with roasted cumin.',
  'Butter Milk':
    'Cooling churned chaas spiced with green chillies, ginger, fresh cilantro, and Himalayan black salt.',
  'Aerated Drinks (200 ml)':
    'Chilled 200ml carbonated beverage bottle — Coca-Cola, Thums Up, Sprite, or Limca.',
  'Soda':
    'Chilled fizzy carbonated club soda.',

  // ── Mocktails & Shakes ─────────────────────────────────────────
  'Electric Blue':
    'Vibrant sparkling mocktail with blue curacao syrup, freshly squeezed lemon juice, and fizzy soda.',
  'Virgin Mojito':
    'Refreshing mountain cooler with muddled garden mint, fresh lime wedges, pure cane sugar, and sparkling soda.',
  'Cardamom Cooler':
    'Soothing aromatic cooler infused with freshly crushed green cardamom, hill lemon, and chilled water.',
  'Homemade Lemonade':
    'Freshly squeezed mountain lemons with fresh mint and cane sugar, served still or fizzy.',
  'Mint Julep':
    'Non-alcoholic cooler with muddled mint leaves, brown sugar, crushed ice, and bubbly ginger ale.',
  'Ice Tea':
    'Freshly brewed black tea chilled over ice with fresh lemon slices and mint leaves.',
  'Orange Lime Relaxer':
    'Refreshing blend of freshly squeezed orange juice, tangy lime, and crushed ice.',
  'Atomic Cat':
    'Zesty reviver crafted with sweet Florida orange juice and spicy ginger ale over crushed ice.',
  'Fruit Punch':
    'Tropical medley of fresh fruit juices with a dash of grenadine and a scoop of vanilla ice cream.',
  'Shirley Temple':
    'Classic sparkling mocktail of ginger ale, grenadine syrup, and a maraschino cherry.',
  'Buransh Juice':
    'Native Uttarakhand wild rhododendron blossom nectar — rich in natural antioxidants with a sweet and tart floral taste.',
  'Litchi Juice':
    'Chilled sweet exotic litchi nectar served over cracked ice.',
  'Oreo Shake':
    'Decadent thick milkshake blended with crunchy chocolate Oreo cookies, vanilla ice cream, and chocolate sauce.',
  'Elaichi Milk Shake':
    'Creamy chilled milk shake perfumed with fragrant green cardamom and topped with crushed dry fruits.',
  'Kesar Milk':
    'Traditional royal milk infused with Kashmiri saffron strands, green cardamom, and slivered almonds.',
  'Plain Milk':
    'Wholesome warm or chilled pasteurized cow milk.',
  'Coldrinks (750 ml)':
    'Large chilled 750ml sharing bottle of carbonated soft drink.',

  // ── Momos ──────────────────────────────────────────────────────
  'Veg Momo':
    'Steamed Himalayan dumplings packed with finely minced seasoned vegetables, served with fiery roasted tomato-chilli dip.',
  'Mushroom Momo':
    'Steamed dumplings filled with garlic-sautéed wild button mushrooms and scallions, paired with spicy chutney.',
  'Paneer Momo':
    'Delicate steamed dumplings stuffed with spiced crumbled cottage cheese and fresh herbs.',
  'Chicken Momo':
    'Juicy steamed dumplings filled with minced spiced chicken, spring onions, and ginger, served with traditional hill dip.',
}

/**
 * Returns a unique, specific culinary description for any menu item.
 * If the database already has a custom description that is NOT the generic placeholder, it preserves it.
 */
export function getDishDescription(name: string, existingDesc?: string | null): string {
  // If database has a genuine description (not null and not containing generic placeholder), use it
  if (existingDesc && existingDesc.trim() && !existingDesc.includes('mountain touch')) {
    return existingDesc.trim()
  }

  // Check exact match in dictionary
  if (DISH_DESCRIPTIONS[name]) {
    return DISH_DESCRIPTIONS[name]
  }

  // Check case-insensitive / trimmed match
  const lower = name.toLowerCase().trim()
  for (const [key, desc] of Object.entries(DISH_DESCRIPTIONS)) {
    if (key.toLowerCase().trim() === lower) {
      return desc
    }
  }

  // Tailored intelligent fallback based on dish characteristics (never uses generic repeated template)
  if (lower.includes('biryani')) {
    return `Aromatic long-grain basmati rice slow dum-cooked with fragrant spices, saffron, and fresh herbs.`
  }
  if (lower.includes('paneer')) {
    return `Fresh cottage cheese cooked in authentic spices and chef's special gravy.`
  }
  if (lower.includes('chicken')) {
    return `Tender chicken pieces cooked to perfection with aromatic spices and herbs.`
  }
  if (lower.includes('mutton')) {
    return `Tender slow-cooked mutton prepared with traditional spices and rich gravy.`
  }
  if (lower.includes('dosa')) {
    return `Crispy golden fermented rice crepe served hot with sambar and fresh chutneys.`
  }
  if (lower.includes('paratha')) {
    return `Freshly griddled layered whole-wheat flatbread served warm with butter and curd.`
  }
  if (lower.includes('pizza')) {
    return `Hand-tossed pizza crust topped with rich herb tomato sauce, premium mozzarella, and fresh seasonings.`
  }
  if (lower.includes('pasta')) {
    return `Al dente Italian pasta tossed in a savory house-made sauce with garlic, herbs, and cheese.`
  }
  if (lower.includes('sandwich')) {
    return `Freshly prepared sandwich filled with quality ingredients, butter, and seasonings.`
  }
  if (lower.includes('soup')) {
    return `Warm comforting soup simmered with fresh ingredients, herbs, and aromatics.`
  }
  if (lower.includes('salad')) {
    return `Crisp, freshly tossed garden vegetables with herbs and a light house dressing.`
  }
  if (lower.includes('shake') || lower.includes('juice') || lower.includes('tea') || lower.includes('coffee')) {
    return `Freshly prepared refreshing beverage served chilled or hot to order.`
  }

  return `Freshly crafted by our culinary team using select ingredients and house seasonings.`
}
