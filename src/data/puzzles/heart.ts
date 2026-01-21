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
      question: 'What  is the name of the Friends episode that has the shoe Kenny likes? ',
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
      question: 'What is the "Monica Approved" fruit do I like to eat the most?',
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
      question: 'What place did you say you wanted to visit when we were on our honeymoon?',
      options: ['Bora Bora', 'Japan', 'Alaska', 'The Maldives'],
      correctAnswer: 2, 
      successMessage: 'I remember that conversation like it was yesterday. One day we will make that trip happen! ✈️🇯🇵',
      points: 15,
      difficulty: 'medium',
      isReserved: true, 
    },
 {
      id: 'heart-12',
      type: 'multiple-choice',
      question: 'Where was I living in Jamaica when we first started dating?',
      options: ['Hanbury', 'Timber Trail', 'Greys Hill', 'Spanish Town'],
      correctAnswer: 0, // Update this index (0=Kingston, 1=Portmore, etc.) to the correct city
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
      imageUrl: '/puzzles/heart/wedding-detail.jpg',
      imageAlt: 'A close up of a small detail from your wedding or engagement',
      question: 'This small detail was hidden on your wedding outfit. What was it?',
      correctAnswer: 'Blue Stitching', // Replace with a specific detail (e.g., "Something Blue")
      acceptableAnswers: ['blue thread', 'something blue'],
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
      imageUrl: '/puzzles/heart/favorite-shoe.jpg',
      imageAlt: 'A zoomed-in photo of a specific sneaker',
      question: 'These were the shoes you wore when we went to that special dinner. Name them!',
      correctAnswer: 'Jordan 1', // Replace with the specific shoe
      acceptableAnswers: ['jordans', 'jordan 1s'],
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
      question: 'What is the "Secret Word" we use when we want to leave a party early?',
      correctAnswer: 'Pineapple', // Replace with your actual safe word/signal
      acceptableAnswers: ['pineapple'],
      placeholder: 'The secret signal...',
      successMessage: 'Let’s go home and watch Gilmore Girls instead! 🍍🏠',
      points: 20,
    difficulty: 'medium',
    },
    {
      id: 'heart-20',
      type: 'image-reveal',
      imageUrl: '/puzzles/heart/proposal-spot.jpg',
      imageAlt: 'A photo of the exact spot where you proposed',
      question: 'Look closely at this view. This is where my life changed forever. Where is this?',
      correctAnswer: 'The Lookout', // Replace with the actual location name
      acceptableAnswers: ['the cliff', 'the park'],
      successMessage: 'The best "Yes" of my entire life. 💍😭',
      points: 35,
    difficulty: 'hard',
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
    difficulty: 'medium',
    },
    {
      id: 'heart-22',
      type: 'text-input',
      question: 'What is the one thing you do that makes me smile every single day?',
      correctAnswer: 'Your laugh', // This is subjective, so make the correctAnswer broad or specific to a habit
      acceptableAnswers: ['laughing', 'your smile', 'bringing me coffee'],
      placeholder: 'It’s something small but perfect...',
      successMessage: 'It truly is the highlight of my day. 😊☀️',
      points: 10,
    difficulty: 'easy',
    },
    {
      id: 'heart-23',
      type: 'image-reveal',
      imageUrl: '/puzzles/heart/us-today.jpg',
      imageAlt: 'A blurred photo of the two of you recently',
      question: 'Through all the code, the sneakers, and the coffee... who is my favorite person in the world?',
      correctAnswer: 'Me',
      acceptableAnswers: ['you', 'your wife'],
      successMessage: 'Always has been, always will be. ❤️',
      points: 50,
    difficulty: 'hard',
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
      question: 'What have we done every single night for the past 200+ nights?',
      options: [
        'Watch an episode of Gilmore Girls',
        'Say "I love you to the moon and back"',
        'Play Wordle',
        'Plan our next trip to Japan'
      ],
      correctAnswer: 1, // Index for "Say 'I love you to the moon and back'"
      successMessage: 'And even further than that! Happy Birthday, my love! 🌙✨',
      points: 10,
      difficulty: 'easy',
    },

    // ========== BONUS PUZZLES (SUDDEN DEATH MODE) ==========
    {
      id: 'heart-bonus-1',
      type: 'text-input',
      question: 'What was the name of the very first song we danced to at our wedding?',
      correctAnswer: '[Kenny: Replace with Song Name]',
      acceptableAnswers: ['[kenny: replace with alternative spellings]'],
      placeholder: 'Our first dance song...',
      successMessage: 'I still hear that song and think of you. 💃🎶',
      points: 50,
      difficulty: 'very-hard',
      isBonus: true,
    },
    {
      id: 'heart-bonus-2',
      type: 'text-input',
      question: 'What is the latitude of the place where we got engaged (First 2 digits)?',
      correctAnswer: '[Kenny: Replace with Lat]',
      acceptableAnswers: ['[kenny: replace with lat]'],
      placeholder: 'Enter 2 digits...',
      successMessage: 'That exact spot changed everything. 🗺️💍',
      points: 50,
      difficulty: 'very-hard',
      isBonus: true,
    },
    {
      id: 'heart-bonus-3',
      type: 'multiple-choice',
      question: 'What was the exact time of our first date?',
      options: ['6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'],
      correctAnswer: 1, // Kenny: Pick One (0=6:30, 1=7:00, 2=7:30, 3=8:00)
      successMessage: 'The moment that started it all. ⏰❤️',
      points: 50,
      difficulty: 'very-hard',
      isBonus: true,
    }
  ],
};
