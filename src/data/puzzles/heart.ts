import type { PathConfig } from '@/types/puzzle';
import { PATH_IDS } from '@/lib/paths';

/**
 * Heart Path - Personal Memories & Our Story
 * Path ID: 3 (Soft Crimson & Rose)
 *
 * 🎁 CUSTOMIZE THESE PUZZLES WITH YOUR REAL MEMORIES! 🎁
 * Replace the placeholder answers and questions with actual details from your relationship.
 * Make them meaningful, romantic, and specific to your love story!
 */
export const heartPath: PathConfig = {
  pathId: PATH_IDS.HEART,
  name: 'Heart',
  puzzles: [
    // --- EASY: SHARED HOBBIES & DAILY LIFE ---
  {
      id: 'heart-6',
      type: 'multiple-choice',
      question: 'Finish these lyrics: "Mi Love you like a..."',
      options: ['Callaloo', 'Fresh vegetable', 'The Sun', 'Beyond'],
      correctAnswer: 1,
      successMessage: 'And even further than that! Happy Birthday, my love! 🌙✨',
      points: 10,
      difficulty: 'easy',
      isReserved: true, // Milestone: The final birthday message
    },
    {
      id: 'heart-7',
      type: 'multiple-choice',
      question: 'Which brand makes up the biggest part of our shared sneaker collection?',
      options: ['Nike/Jordan', 'Adidas', 'Clarks', 'New Balance'],
      correctAnswer: 0, // Update this if it's actually Clarks or another!
      hint: 'Think about the "Jumpman" or the "Swoosh."',
      successMessage: 'You got it! We really do have a "sole-mate" connection! 👟❤️',
      points: 10,
      difficulty: 'easy',
      isReserved: true,
    },
   {
      id: 'heart-26',
      type: 'multiple-choice',
      question: 'If I [Kenny] were left home alone for 24 hours, what would I most likely be doing the entire time?',
      options: [
        'Eating on the Carpet',
        'Skipping with no pants on',
        'Getting bored after 3 hours wondering when you will be home',
        'All of the above (and probably forgetting to drink water and stretching )'
      ],
      correctAnswer: 3, // Suggested: All of the above!
      successMessage: 'You know me too well! A little bit of code, a lot of sneakers, and definitely some Stars Hollow. 🍕💻',
      points: 15,
      difficulty: 'medium',
    },

    // --- MEDIUM: MILESTONES & MEMORIES ---
    {
      id: 'heart-9',
      type: 'multiple-choice',
      question: 'What  is the name of the Friends episode that has the sneakers Kenny likes? ',
      options: [', "The One With Monica\'s Boots', 'The One With the Routine', 'The One About A Classic Horror', 'The One Where No One\'s Ready'],
      correctAnswer: 1, // Replace with your actual first movie genre/title
      hint: 'I remember we had popcorn and you fell asleep halfway through...',
      successMessage: 'Perfect memory! Even if we didn\'t finish it, it was the best night. 🍿🎬',
      points: 20,
    difficulty: 'medium',
    },
    {
      id: 'heart-10',
      type: 'text-input',
      question: 'What fruit do I [Kenny] like to eat the most?',
      correctAnswer: 'Grapes', // Replace with her favorite meal you cook
      acceptableAnswers: ['grape', 'grapes'],
      placeholder: 'Name the fruit...',
      hint: 'It’s your favorite thing to have as a snack.',
      successMessage: ' Bon Appétit!',
      points: 20,
    difficulty: 'easy',
    },
{
      id: 'heart-11',
      type: 'multiple-choice',
      question: 'What place did you say you wanted to visit when we were on our honeymoon? Hint: We were playing the group game in the pool at Sandals, Jamaica (2008).?',
      options: ['Bora Bora', 'Japan', 'Alaska', 'The Maldives'],
      correctAnswer: 2, 
      successMessage: 'I remember that conversation like it was yesterday. One day we will make that trip happen! ',
      points: 15,
      difficulty: 'medium',
      isReserved: true, 
    },
 {
      id: 'heart-12',
      type: 'multiple-choice',
      question: 'Where was I living in Jamaica when we first started dating?',
      options: ['Hanbury', 'Timber Trail', 'Greys Hill', 'Spanish Town'],
      correctAnswer: 1, // Update this index (0=Kingston, 1=Portmore, etc.) to the correct city
      successMessage: 'Correct! Those were the days of long drives and even longer phone calls. 🇯🇲❤️',
      points: 15,
      difficulty: 'easy',
    },

    // --- HARD: THE LITTLE DETAILS ---
   {
      id: 'heart-13',
      type: 'multiple-choice',
      question: 'Which movie or TV show would we watch for hours in bed when you visited me in Jamaica?',
      options: ['Law & Order', 'Criminal Minds', 'Grey\'s Anatomy', 'Suits'],
      correctAnswer: 0, // Index for 'Law & Order'
      successMessage: 'Dun-dun! We really did spend entire days bingeing those cases together. ⚖️📺',
      points: 30,
      difficulty: 'hard',
    },
    {
      id: 'heart-14',
      type: 'image-reveal',
      imageUrl: '/puzzles/heart/wed.jpg',
      imageAlt: 'A close up of a small detail from your wedding or engagement',
      question: 'This small item can be found in a wedding photo outfit. What was it?',
      correctAnswer: 'Flower Corsage ', // Replace with a specific detail (e.g., "Something Blue")
      acceptableAnswers: ['flower corsage ', 'flower','corsage', 'flowers corsage','flowers' ],
      successMessage: 'Your attention to detail is why I love you! 💍🧵',
      points: 35,
    difficulty: 'hard',
    },
 {
      id: 'heart-15',
      type: 'text-input',
      question: 'What movie or TV show would I have you record for me to binge-watch when I visited Lakeland, Florida?',
      correctAnswer: 'Bridezilla',
      acceptableAnswers: ['bridezilla', 'bridezillas'],
      placeholder: 'Name the show...',
      successMessage: 'Correct! We definitely spent a lot of time watching those wedding meltdowns! 👰‍♀️😤',
      points: 20,
      difficulty: 'hard',
    },
    // --- FUN & WARM: INSIDE JOKES ---
  {
      id: 'heart-16',
      type: 'multiple-choice',
      question: 'What color shirt was I wearing when I proposed?',
      options: [
        'A solid white button-down',
        'A multi-color striped shirt',
        'A navy blue polo',
        'A grey linen shirt'
      ],
      correctAnswer: 1,
      successMessage: 'Correct! That multi-color striped shirt (with the yellow stripes) is now a legendary part of our story. 👕✨',
      points: 20,
      difficulty: 'medium',
    },
    {
      id: 'heart-17',
      type: 'image-reveal',
      imageUrl: '/puzzles/heart/favorite-shoe.png',
      imageAlt: 'A zoomed-in photo of a specific sneaker',
      question: 'These were a pair of sneakers I bought you a few years ago. Name the brand!',
      correctAnswer: 'Jordan 1', // Replace with the specific shoe
      acceptableAnswers: ['jordans', 'jordan 1s', 'Jordan'],
      successMessage: 'You looked incredible that night (and every night)! 👟🔥',
      points: 25,
    difficulty: 'medium',
    },
 {
      id: 'heart-18',
      type: 'multiple-choice',
      question: 'What is the one thing I always "lose" that you always find for me?',
      options: ['My Keys', 'My Phone', 'My Glasses', 'All of the above'],
      correctAnswer: 3,
      successMessage: 'Exactly! Thank you for always being my "Internal GPS" for everything I misplace. 🧭❤️',
      points: 15,
      difficulty: 'easy',
    },
 {
      id: 'heart-19',
      type: 'text-input',
      question: 'In 2025, we bought a sleek new car to take us on adventures. What did we name it?',
      correctAnswer: 'Yardie',
      acceptableAnswers: ['yardie', 'the yardie'],
      placeholder: 'Enter the name...',
      successMessage: 'Beep beep! "Yardie" is officially our favorite way to get around! 🚗⚡🇯🇲',
      points: 20,
      difficulty: 'medium',
    },
  {
      id: 'heart-21',
      type: 'multiple-choice',
      question: '2025 was officially the year of the "Master Plan." You were the lead strategist and organizer for our epic tour of which two professional sports leagues?',
      options: [
        'NBA and WNBA',
        'NFL and MLB',
        'NHL and MLS',
        'Premier League and Champions League'
      ],
      correctAnswer: 0,
      successMessage: 'You nailed it! Your meticulous planning and organization made every arena visit seamless and unforgettable. 🏀🎟️',
      points: 25,
      difficulty: 'easy',
    },
    // --- WRAPPING UP: FUTURE & FEELINGS ---
    {
      id: 'heart-21',
      type: 'multiple-choice',
      question: 'Where was the "Dream Destination" for my 40th birthday?',
      options: ['Japan', 'Italy', 'Paris', 'The Maldives'],
      correctAnswer: 0, // Update to her dream trip
      successMessage: 'Pack your bags, because I’m making it happen! 🇯🇵✈️',
      points: 25,
    difficulty: 'easy',
    },
  {
      id: 'heart-22',
      type: 'text-input',
      question: 'In 2025, you hit the pavement and crushed a major fitness milestone. What was the distance of the race you ran?',
      correctAnswer: '5k',
      acceptableAnswers: ['5k', '5 kilometers', 'five k', 'five kilometers'],
      placeholder: 'Enter the distance...',
      successMessage: 'Yes! You ran that 5k like a pro. Your discipline and drive are so inspiring! 🏃‍♀️🏅',
      points: 10,
      difficulty: 'easy',
    },
 {
      id: 'heart-23',
      type: 'text-input',
      question: 'Our 15-night voyage from Singapore to Japan was the trip of a lifetime. What was the name of the Celebrity ship where we shared all those incredible sunsets?',
      correctAnswer: 'Millennium',
      acceptableAnswers: ['millennium', 'celebrity millennium', 'the millennium'],
      placeholder: 'Enter the ship name...',
      successMessage: 'Exactly! The Celebrity Millennium was the perfect home for our 2025 Asian adventure. 🚢🌏✨',
      points: 50,
      difficulty: 'easy',
    },
    {
      id: 'heart-24',
      type: 'multiple-choice',
      question: 'How many days have we been married (approx)?',
      options: ['500', '1000', '1500', 'Not enough!'],
      correctAnswer: 3,
      successMessage: 'Every day is a gift with you. 🎁❤️',
      points: 10,
    difficulty: 'easy',
    },
  {
      id: 'heart-25',
      type: 'multiple-choice',
      question: 'What have we done every single night for the past 100+ nights?',
      options: [
        'Watch an episode of Gilmore Girls',
        'Say "I love you to the moon and back"',
        'Play Wordle',
        'Plan our next trip to Japan'
      ],
      correctAnswer: 2, // Index for "Say 'I love you to the moon and back'"
      successMessage: 'And even further than that! Happy Birthday, my love! 🌙✨',
      points: 10,
      difficulty: 'easy',
    },

    // ========== BONUS PUZZLES (SUDDEN DEATH MODE) ==========
    {
      id: 'heart-bonus-1',
      type: 'text-input',
      question: 'Our 15-night voyage on the Millennium was a dream. After departing Singapore and spending a full day at sea, what was the specific name of our very first port of call in Vietnam?',
      correctAnswer: 'Phu My',
      acceptableAnswers: ['phu my', 'phumy'],
      placeholder: 'Enter the port name...',
      successMessage: 'Incredible memory! Docking at Phu My was the start of an unforgettable week in Vietnam. 🚢🇻🇳',
      points: 50,
      difficulty: 'very-hard',
      isBonus: true,
    },
    {
      id: 'heart-bonus-2',
      type: 'text-input',
      question: 'You are an expert on airplane types. Earlier this year, we saw a specific wide-body aircraft famous for its distinctive "raccoon mask" black cockpit window surround. What is the technical model name of this Airbus plane?',
      correctAnswer: 'A350',
      acceptableAnswers: ['a350', 'airbus a350', 'a350-900', 'a350-1000'],
      placeholder: 'Enter the model...',
      successMessage: 'Spot on! The A350 is a masterpiece of aviation, and your eye for detail is unmatched. ✈️🎭',
      points: 50,
      difficulty: 'very-hard',
      isBonus: true,
    },
{
      id: 'heart-bonus-3',
      type: 'multiple-choice',
      question: 'Our 2024 Ioniq 5 ("Yardie") is full of "Easter Eggs." On the steering wheel, there are four dots instead of a logo. These dots represent a specific letter in Morse Code. What letter is it?',
      options: [
        'H (for Hyundai)',
        'I (for Ioniq)',
        'Y (for Yardie)',
        'E (for Electric)'
      ],
      correctAnswer: 0, // H is .... in Morse code
      successMessage: 'You are an absolute EV expert! Those four dots (....) are Morse code for "H." It’s the perfect hidden detail for our favorite ride. 🚗⚡🇯🇲',
      points: 50,
      difficulty: 'very-hard',
      isBonus: true,
    }
  ],
};
