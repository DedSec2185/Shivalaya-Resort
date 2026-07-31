import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RESTAURANT_SLUG } from '@panache/supabase-schema';
import { getRuntimeEnv } from '@panache/shared-types';

export function useMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMenu() {
      setLoading(true);
      setError(null);

      const { isDemoMode } = getRuntimeEnv(import.meta.env);

      if (isDemoMode) {
        // MOCK DATA
        const mockData = [
  {
    "id": "1",
    "section": "Breakfast",
    "name": "Cereals with Milk",
    "price": 160,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "2",
    "section": "Breakfast",
    "name": "Canned Juice",
    "price": 120,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "3",
    "section": "Breakfast",
    "name": "Pancake",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "4",
    "section": "Breakfast",
    "name": "Puri Bhaji",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "5",
    "section": "Breakfast",
    "name": "Tawa Paratha with Stuffing of Choice (2 pcs)",
    "price": 300,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "6",
    "section": "Breakfast",
    "name": "Tandoori Paratha with Stuffing of Choice (2 pcs)",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "7",
    "section": "Breakfast",
    "name": "Chole Bhature",
    "price": 300,
    "veg": true,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "8",
    "section": "Breakfast",
    "name": "Poha / Vermicelli Upma / Rawa Choice",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "9",
    "section": "Breakfast",
    "name": "Cutlet / Aloo Bonda / Bread Pakora / Bread Roll (2 pcs)",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 9
  },
  {
    "id": "10",
    "section": "Breakfast",
    "name": "Plain Dosa",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 10
  },
  {
    "id": "11",
    "section": "Breakfast",
    "name": "Onion / Masala Dosa",
    "price": 300,
    "veg": true,
    "available": true,
    "sort_order": 11
  },
  {
    "id": "12",
    "section": "Breakfast",
    "name": "Paneer / Cheese Dosa",
    "price": 400,
    "veg": true,
    "available": true,
    "sort_order": 12
  },
  {
    "id": "13",
    "section": "Breakfast",
    "name": "Utthapam / Idli / Medu Vada",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 13
  },
  {
    "id": "14",
    "section": "Egg to Order",
    "name": "Cheese Omelette",
    "price": 250,
    "veg": false,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "15",
    "section": "Egg to Order",
    "name": "Bread Omelette",
    "price": 200,
    "veg": false,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "16",
    "section": "Egg to Order",
    "name": "Boiled Egg (2 pcs)",
    "price": 100,
    "veg": false,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "17",
    "section": "Egg to Order",
    "name": "Egg Bhurji",
    "price": 180,
    "veg": false,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "18",
    "section": "Egg to Order",
    "name": "Sunny Side Up / Half Fry / Egg Poach (2 pcs)",
    "price": 150,
    "veg": false,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "19",
    "section": "Egg to Order",
    "name": "Scrambled Egg (2 pcs)",
    "price": 180,
    "veg": false,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "20",
    "section": "Starters – Veg",
    "name": "Chilli Paneer",
    "price": 400,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "21",
    "section": "Starters – Veg",
    "name": "Honey Chilli Potato",
    "price": 300,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "22",
    "section": "Starters – Veg",
    "name": "Cheese Balls",
    "price": 300,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "23",
    "section": "Starters – Veg",
    "name": "Crispy Corn",
    "price": 400,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "24",
    "section": "Starters – Veg",
    "name": "Veg Spring Roll",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "25",
    "section": "Starters – Veg",
    "name": "Veg Kathi Roll",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "26",
    "section": "Starters – Veg",
    "name": "Mushroom Tikka",
    "price": 500,
    "veg": true,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "27",
    "section": "Starters – Veg",
    "name": "Paneer Tikka",
    "price": 600,
    "veg": true,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "28",
    "section": "Starters – Veg",
    "name": "Soya Chaap / Soya Malai Chaap",
    "price": 300,
    "veg": true,
    "available": true,
    "sort_order": 9
  },
  {
    "id": "29",
    "section": "Starters – Non-Veg",
    "name": "Non-Veg Spring Roll",
    "price": 500,
    "veg": false,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "30",
    "section": "Starters – Non-Veg",
    "name": "Non-Veg Kathi Roll",
    "price": 500,
    "veg": false,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "31",
    "section": "Starters – Non-Veg",
    "name": "Chilli Chicken / Chicken 65",
    "price": 600,
    "veg": false,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "32",
    "section": "Starters – Non-Veg",
    "name": "Chicken Seekh Kabab",
    "price": 650,
    "veg": false,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "33",
    "section": "Starters – Non-Veg",
    "name": "Chicken Malai Tikka",
    "price": 650,
    "veg": false,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "34",
    "section": "Starters – Non-Veg",
    "name": "Chicken Tikka",
    "price": 600,
    "veg": false,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "35",
    "section": "Starters – Non-Veg",
    "name": "Bhatti Murg",
    "price": 800,
    "veg": false,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "36",
    "section": "Starters – Non-Veg",
    "name": "Chicken Haryali Tikka",
    "price": 650,
    "veg": false,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "37",
    "section": "Soup",
    "name": "Cream of Tomato",
    "price": 300,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "38",
    "section": "Soup",
    "name": "Manchow Soup",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "39",
    "section": "Soup",
    "name": "Dhaniya Shorba",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "40",
    "section": "Soup",
    "name": "Sweet Corn",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "41",
    "section": "Soup",
    "name": "Minestrone",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "42",
    "section": "Soup",
    "name": "Chicken Clear Soup",
    "price": 250,
    "veg": false,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "43",
    "section": "Soup",
    "name": "Chicken Coriander Soup",
    "price": 250,
    "veg": false,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "44",
    "section": "Salad",
    "name": "Green Salad",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "45",
    "section": "Salad",
    "name": "Russian / Kimchi / Finger Salad",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "46",
    "section": "Salad",
    "name": "Protein Salad",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "47",
    "section": "Indian Main – Paneer",
    "name": "Kadahi Paneer",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "48",
    "section": "Indian Main – Paneer",
    "name": "Shahi Paneer",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "49",
    "section": "Indian Main – Paneer",
    "name": "Paneer Do Pyaza",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "50",
    "section": "Indian Main – Paneer",
    "name": "Makhani Paneer",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "51",
    "section": "Indian Main – Paneer",
    "name": "Paneer Butter Masala",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "52",
    "section": "Indian Main – Paneer",
    "name": "Methi Malai Paneer",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "53",
    "section": "Indian Main – Paneer",
    "name": "Paneer Lababdar",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "54",
    "section": "Indian Main – Paneer",
    "name": "Palak Paneer",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "55",
    "section": "Indian Main – Paneer",
    "name": "Paneer Pasanda",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 9
  },
  {
    "id": "56",
    "section": "Indian Main – Paneer",
    "name": "Paneer Kofta",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 10
  },
  {
    "id": "57",
    "section": "Indian Main – Paneer",
    "name": "Paneer Bhurji",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 11
  },
  {
    "id": "58",
    "section": "Indian Main – Paneer",
    "name": "Paneer Tikka Masala",
    "price": 650,
    "veg": true,
    "available": true,
    "sort_order": 12
  },
  {
    "id": "59",
    "section": "Seasonal Vegetable",
    "name": "Bhindi Do Pyaza",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "60",
    "section": "Seasonal Vegetable",
    "name": "Aloo Jeera",
    "price": 300,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "61",
    "section": "Seasonal Vegetable",
    "name": "Aloo Gobhi Adrakhi",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "62",
    "section": "Seasonal Vegetable",
    "name": "Heeng Aloo Beans",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "63",
    "section": "Seasonal Vegetable",
    "name": "Achari Baigan",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "64",
    "section": "Seasonal Vegetable",
    "name": "Dum Aloo",
    "price": 400,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "65",
    "section": "Seasonal Vegetable",
    "name": "Matar Mushroom",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "66",
    "section": "Seasonal Vegetable",
    "name": "Mushroom Butter Masala",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "67",
    "section": "Seasonal Vegetable",
    "name": "Mushroom Do Pyaza",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 9
  },
  {
    "id": "68",
    "section": "Seasonal Vegetable",
    "name": "Mushroom Masala",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 10
  },
  {
    "id": "69",
    "section": "Seasonal Vegetable",
    "name": "Vegetable in Sweet and Sour Gravy",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 11
  },
  {
    "id": "70",
    "section": "Seasonal Vegetable",
    "name": "Manchurian Gravy",
    "price": 400,
    "veg": true,
    "available": true,
    "sort_order": 12
  },
  {
    "id": "71",
    "section": "Indian Main – Chicken",
    "name": "Kadahi Chicken",
    "price": 650,
    "veg": false,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "72",
    "section": "Indian Main – Chicken",
    "name": "Chicken Curry",
    "price": 650,
    "veg": false,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "73",
    "section": "Indian Main – Chicken",
    "name": "Chicken Masala",
    "price": 650,
    "veg": false,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "74",
    "section": "Indian Main – Chicken",
    "name": "Kali Mirch Chicken",
    "price": 700,
    "veg": false,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "75",
    "section": "Indian Main – Chicken",
    "name": "Chicken Masala Tikka",
    "price": 650,
    "veg": false,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "76",
    "section": "Indian Main – Chicken",
    "name": "Mughlai Chicken",
    "price": 700,
    "veg": false,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "77",
    "section": "Indian Main – Chicken",
    "name": "Afghani Chicken",
    "price": 700,
    "veg": false,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "78",
    "section": "Indian Main – Chicken",
    "name": "Butter Chicken",
    "price": 700,
    "veg": false,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "79",
    "section": "Indian Main – Chicken",
    "name": "Handi Chicken",
    "price": 650,
    "veg": false,
    "available": true,
    "sort_order": 9
  },
  {
    "id": "80",
    "section": "Indian Main – Chicken",
    "name": "Rogan Josh Chicken",
    "price": 650,
    "veg": false,
    "available": true,
    "sort_order": 10
  },
  {
    "id": "81",
    "section": "Indian Main – Chicken",
    "name": "Haryali Chicken",
    "price": 650,
    "veg": false,
    "available": true,
    "sort_order": 11
  },
  {
    "id": "82",
    "section": "Indian Main – Chicken",
    "name": "Panache Chicken (Chef Special)",
    "price": 750,
    "veg": false,
    "available": true,
    "sort_order": 12
  },
  {
    "id": "83",
    "section": "Choice of Mutton",
    "name": "Panache Mutton (Chef Special)",
    "price": 1000,
    "veg": false,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "84",
    "section": "Choice of Mutton",
    "name": "Handi Mutton",
    "price": 1000,
    "veg": false,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "85",
    "section": "Choice of Mutton",
    "name": "Korma Mutton",
    "price": 1000,
    "veg": false,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "86",
    "section": "Choice of Mutton",
    "name": "Rogan Josh Mutton",
    "price": 1000,
    "veg": false,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "87",
    "section": "Choice of Mutton",
    "name": "Haryali Mutton",
    "price": 1000,
    "veg": false,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "88",
    "section": "Indian Main – Dal",
    "name": "Dal Tadka / Dal Fry",
    "price": 400,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "89",
    "section": "Indian Main – Dal",
    "name": "Dal Makhani",
    "price": 500,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "90",
    "section": "Indian Main – Dal",
    "name": "Dal Sultani",
    "price": 400,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "91",
    "section": "Indian Main – Dal",
    "name": "Dal Panchmeel",
    "price": 400,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "92",
    "section": "Indian Main – Dal",
    "name": "Rajma Rasila",
    "price": 400,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "93",
    "section": "Choices of Vegetable",
    "name": "Mix Veg / Sabz Miloni",
    "price": 450,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "94",
    "section": "Choices of Vegetable",
    "name": "Veg Jaipuri",
    "price": 450,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "95",
    "section": "Panache Platters",
    "name": "Veg Platter",
    "price": 900,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "96",
    "section": "Panache Platters",
    "name": "Non Veg Platter",
    "price": 1200,
    "veg": false,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "97",
    "section": "Indian Bread",
    "name": "Tawa Roti",
    "price": 25,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "98",
    "section": "Indian Bread",
    "name": "Butter Tawa Roti",
    "price": 30,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "99",
    "section": "Indian Bread",
    "name": "Tandoori Roti",
    "price": 40,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "100",
    "section": "Indian Bread",
    "name": "Butter Tandoori Roti",
    "price": 50,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "101",
    "section": "Indian Bread",
    "name": "Missi Roti",
    "price": 60,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "102",
    "section": "Indian Bread",
    "name": "Butter Missi Roti",
    "price": 70,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "103",
    "section": "Indian Bread",
    "name": "Plain Naan",
    "price": 60,
    "veg": true,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "104",
    "section": "Indian Bread",
    "name": "Butter Plain Naan",
    "price": 70,
    "veg": true,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "105",
    "section": "Indian Bread",
    "name": "Garlic Naan",
    "price": 80,
    "veg": true,
    "available": true,
    "sort_order": 9
  },
  {
    "id": "106",
    "section": "Indian Bread",
    "name": "Butter Garlic Naan",
    "price": 90,
    "veg": true,
    "available": true,
    "sort_order": 10
  },
  {
    "id": "107",
    "section": "Indian Bread",
    "name": "Laccha Paratha",
    "price": 90,
    "veg": true,
    "available": true,
    "sort_order": 11
  },
  {
    "id": "108",
    "section": "Indian Bread",
    "name": "Butter Chiplets",
    "price": 50,
    "veg": true,
    "available": true,
    "sort_order": 12
  },
  {
    "id": "109",
    "section": "Rice",
    "name": "Steamed / Jeera Rice",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "110",
    "section": "Rice",
    "name": "Veg Fried Rice",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "111",
    "section": "Rice",
    "name": "Butter Onion Rice",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "112",
    "section": "Rice",
    "name": "Peas Pulao",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "113",
    "section": "Rice",
    "name": "Veg Pulao",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "114",
    "section": "Rice",
    "name": "Veg Briyani",
    "price": 500,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "115",
    "section": "Rice",
    "name": "Chicken Biryani",
    "price": 750,
    "veg": false,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "116",
    "section": "Rice",
    "name": "Mutton Biryani",
    "price": 1200,
    "veg": false,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "117",
    "section": "Rice",
    "name": "Chicken Fried Rice",
    "price": 550,
    "veg": false,
    "available": true,
    "sort_order": 9
  },
  {
    "id": "118",
    "section": "Rice",
    "name": "Egg Fried Rice",
    "price": 450,
    "veg": false,
    "available": true,
    "sort_order": 10
  },
  {
    "id": "119",
    "section": "Rice",
    "name": "Chilli Garlic Fried Rice",
    "price": 450,
    "veg": true,
    "available": true,
    "sort_order": 11
  },
  {
    "id": "120",
    "section": "Rice",
    "name": "Schezwan Chicken Fried Rice",
    "price": 650,
    "veg": false,
    "available": true,
    "sort_order": 12
  },
  {
    "id": "121",
    "section": "Italian",
    "name": "Alfredo Sauce Pasta",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "122",
    "section": "Italian",
    "name": "Arrabita Sauce Pasta",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "123",
    "section": "Italian",
    "name": "Mixed Sauce Pasta",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "124",
    "section": "Italian",
    "name": "Mushroom Pizza",
    "price": 450,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "125",
    "section": "Italian",
    "name": "Corn Pizza",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "126",
    "section": "Italian",
    "name": "Plain Pizza",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "127",
    "section": "Italian",
    "name": "Paneer Peppery",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "128",
    "section": "Italian",
    "name": "Pizza with Topping of Choice",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "129",
    "section": "Italian",
    "name": "Margherita Pizza",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 9
  },
  {
    "id": "130",
    "section": "Kumaoni (Pahadi)",
    "name": "Bhat Ki Chudkani / Gahot Ki Dal",
    "price": 550,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "131",
    "section": "Kumaoni (Pahadi)",
    "name": "Mooli Thechuani / Aloo Gutke / Bhat Ke Dupke / Palak Kafa",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "132",
    "section": "Kumaoni (Pahadi)",
    "name": "Mandua Ki Roti",
    "price": 60,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "133",
    "section": "Kumaoni (Pahadi)",
    "name": "Boondi Raita",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "134",
    "section": "Kumaoni (Pahadi)",
    "name": "Kukumber Raita",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "135",
    "section": "Kumaoni (Pahadi)",
    "name": "Kumaoni Raita",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "136",
    "section": "Kumaoni (Pahadi)",
    "name": "Jhungar Ki Kheer",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "137",
    "section": "Kumaoni (Pahadi)",
    "name": "Kumaoni Badi Ki Sabzi",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "138",
    "section": "Kumaoni (Pahadi)",
    "name": "Kumaoni Chicken",
    "price": 700,
    "veg": false,
    "available": true,
    "sort_order": 9
  },
  {
    "id": "139",
    "section": "Kumaoni (Pahadi)",
    "name": "Kumaoni Mutton",
    "price": 1200,
    "veg": false,
    "available": true,
    "sort_order": 10
  },
  {
    "id": "140",
    "section": "Kumaoni (Pahadi)",
    "name": "Plain Khichdi",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 11
  },
  {
    "id": "141",
    "section": "Kumaoni (Pahadi)",
    "name": "Moong Dal Khichdi",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 12
  },
  {
    "id": "142",
    "section": "Dessert",
    "name": "Kesari Kheer / Phirni",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "143",
    "section": "Dessert",
    "name": "Ice Cream",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "144",
    "section": "Dessert",
    "name": "Gulab Jamun (2 pcs)",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "145",
    "section": "Dessert",
    "name": "Rasmalai",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "146",
    "section": "Dessert",
    "name": "Fruit Custard",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "147",
    "section": "Dessert",
    "name": "Malpua with Rabri / Shahi Tukda",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "148",
    "section": "Sandwich",
    "name": "Veg Plain Sandwich",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "149",
    "section": "Sandwich",
    "name": "Chicken Plain Sandwich",
    "price": 200,
    "veg": false,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "150",
    "section": "Sandwich",
    "name": "Grill / Club Sandwich",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "151",
    "section": "Sandwich",
    "name": "Chicken Grill Sandwich",
    "price": 350,
    "veg": false,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "152",
    "section": "Sandwich",
    "name": "Chocolate Sandwich",
    "price": 300,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "153",
    "section": "Sandwich",
    "name": "Rainbow Sandwich",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "154",
    "section": "Sides",
    "name": "French Fries",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "155",
    "section": "Sides",
    "name": "Chilli Cheese Toast",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "156",
    "section": "Sides",
    "name": "Paneer Pakoda",
    "price": 350,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "157",
    "section": "Sides",
    "name": "Chicken Pakoda",
    "price": 450,
    "veg": false,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "158",
    "section": "Sides",
    "name": "Fish Pakoda",
    "price": 350,
    "veg": false,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "159",
    "section": "Sides",
    "name": "Masala Maggi",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "160",
    "section": "Sides",
    "name": "Mix Veg Pakora",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "161",
    "section": "Sides",
    "name": "Egg Maggi",
    "price": 200,
    "veg": false,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "162",
    "section": "Sides",
    "name": "Peanut Masala",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 9
  },
  {
    "id": "163",
    "section": "Sides",
    "name": "Masala Papad",
    "price": 120,
    "veg": true,
    "available": true,
    "sort_order": 10
  },
  {
    "id": "164",
    "section": "Sides",
    "name": "Aloo Chat",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 11
  },
  {
    "id": "165",
    "section": "Sides",
    "name": "Veg Hakka Noodles",
    "price": 300,
    "veg": true,
    "available": true,
    "sort_order": 12
  },
  {
    "id": "166",
    "section": "Sides",
    "name": "Crispy Chidwa",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 13
  },
  {
    "id": "167",
    "section": "Sides",
    "name": "Butter Pav Bhaji",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 14
  },
  {
    "id": "168",
    "section": "Sides",
    "name": "Veg Burger",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 15
  },
  {
    "id": "169",
    "section": "Sides",
    "name": "Chicken Burger",
    "price": 250,
    "veg": false,
    "available": true,
    "sort_order": 16
  },
  {
    "id": "170",
    "section": "Sides",
    "name": "Paneer / Cheese Burger",
    "price": 250,
    "veg": true,
    "available": true,
    "sort_order": 17
  },
  {
    "id": "171",
    "section": "Beverages",
    "name": "Tea",
    "price": 80,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "172",
    "section": "Beverages",
    "name": "Coffee",
    "price": 120,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "173",
    "section": "Beverages",
    "name": "Cold Coffee",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "174",
    "section": "Beverages",
    "name": "Hot Chocolate",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "175",
    "section": "Beverages",
    "name": "Lassi Sweet / Salt",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "176",
    "section": "Beverages",
    "name": "Butter Milk",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "177",
    "section": "Beverages",
    "name": "Aerated Drinks (200 ml)",
    "price": 50,
    "veg": true,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "178",
    "section": "Beverages",
    "name": "Soda",
    "price": 50,
    "veg": true,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "179",
    "section": "Mocktail Zone",
    "name": "Electric Blue",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "180",
    "section": "Mocktail Zone",
    "name": "Virgin Mojito",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "181",
    "section": "Mocktail Zone",
    "name": "Cardamom Cooler",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "182",
    "section": "Mocktail Zone",
    "name": "Homemade Lemonade",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 4
  },
  {
    "id": "183",
    "section": "Mocktail Zone",
    "name": "Mint Julep",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 5
  },
  {
    "id": "184",
    "section": "Mocktail Zone",
    "name": "Ice Tea",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 6
  },
  {
    "id": "185",
    "section": "Mocktail Zone",
    "name": "Orange Lime Relaxer",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 7
  },
  {
    "id": "186",
    "section": "Mocktail Zone",
    "name": "Atomic Cat",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 8
  },
  {
    "id": "187",
    "section": "Mocktail Zone",
    "name": "Fruit Punch",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 9
  },
  {
    "id": "188",
    "section": "Mocktail Zone",
    "name": "Shirley Temple",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 10
  },
  {
    "id": "189",
    "section": "Mocktail Zone",
    "name": "Buransh Juice",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 11
  },
  {
    "id": "190",
    "section": "Mocktail Zone",
    "name": "Litchi Juice",
    "price": 150,
    "veg": true,
    "available": true,
    "sort_order": 12
  },
  {
    "id": "191",
    "section": "Mocktail Zone",
    "name": "Oreo Shake",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 13
  },
  {
    "id": "192",
    "section": "Mocktail Zone",
    "name": "Elaichi Milk Shake",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 14
  },
  {
    "id": "193",
    "section": "Mocktail Zone",
    "name": "Kesar Milk",
    "price": 200,
    "veg": true,
    "available": true,
    "sort_order": 15
  },
  {
    "id": "194",
    "section": "Mocktail Zone",
    "name": "Plain Milk",
    "price": 80,
    "veg": true,
    "available": true,
    "sort_order": 16
  },
  {
    "id": "195",
    "section": "Mocktail Zone",
    "name": "Coldrinks (750 ml)",
    "price": 80,
    "veg": true,
    "available": true,
    "sort_order": 17
  },
  {
    "id": "196",
    "section": "Momos",
    "name": "Veg Momo",
    "price": 300,
    "veg": true,
    "available": true,
    "sort_order": 1
  },
  {
    "id": "197",
    "section": "Momos",
    "name": "Mushroom Momo",
    "price": 400,
    "veg": true,
    "available": true,
    "sort_order": 2
  },
  {
    "id": "198",
    "section": "Momos",
    "name": "Paneer Momo",
    "price": 400,
    "veg": true,
    "available": true,
    "sort_order": 3
  },
  {
    "id": "199",
    "section": "Momos",
    "name": "Chicken Momo",
    "price": 400,
    "veg": false,
    "available": true,
    "sort_order": 4
  }
];

        if (!cancelled) {
          setItems(mockData);
          setLoading(false);
        }
        return;
      }

      const { data: restaurant, error: restError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', RESTAURANT_SLUG)
        .single();

      if (restError || !restaurant) {
        if (!cancelled) {
          setError(restError?.message || 'Restaurant not found');
          setLoading(false);
        }
        return;
      }

      const { data, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('available', true)
        .order('section')
        .order('sort_order');

      if (!cancelled) {
        if (menuError) {
          setError(menuError.message);
        } else {
          setItems(data || []);
        }
        setLoading(false);
      }
    }

    fetchMenu();

    const channel = supabase
      .channel('menu-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => fetchMenu()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const sections = useMemo(() => {
    const seen = new Set();
    const ordered = [];
    for (const item of items) {
      if (!seen.has(item.section)) {
        seen.add(item.section);
        ordered.push(item.section);
      }
    }
    return ordered;
  }, [items]);

  const itemsBySection = useMemo(() => {
    const map = {};
    for (const section of sections) {
      map[section] = items.filter((i) => i.section === section);
    }
    return map;
  }, [items, sections]);

  return { items, sections, itemsBySection, loading, error };
}
