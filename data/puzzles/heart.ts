import type { PathConfig } from '@/types/puzzle';
import { PATH_IDS } from '@/store/useQuestStore';

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
      type: 'text-input',
      question: 'What is the name of our home Wi-Fi network?',
      // Based on your troubleshooting logs!
      correctAnswer: 'TheWhyteHouse',
      acceptableAnswers: ['thewhytehouse', 'the whyte house', 'whyte house'],
      placeholder: 'Our digital home name...',
      hint: 'It’s a play on our last name and a famous building!',
      successMessage: 'Correct! There is no place like #TheWhyteHouse with you. 🏠💻',
      points: 10,
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
    },
    {
      id: 'heart-8',
      type: 'image-reveal',
      imageUrl: '/puzzles/heart/sneaker-app.jpg',
      imageAlt: 'A screenshot of a mobile app showing shoe inventory',
      question: 'We spent hours building an app together to track our shoes. What was the "secret" tab name for inspiration?',
      correctAnswer: 'Inspo',
      acceptableAnswers: ['inspo', 'inspiration', 'the inspo tab'],
      successMessage: 'Yes! You are my forever inspiration. 📱✨',
      points: 15,
    },

    // --- MEDIUM: MILESTONES & MEMORIES ---
    {
      id: 'heart-9',
      type: 'multiple-choice',
      question: 'What was the first movie we ever watched together at home?',
      options: ['A Marvel Movie', 'A Romantic Comedy', 'A Classic Horror', 'A Disney Movie'],
      correctAnswer: 1, // Replace with your actual first movie genre/title
      hint: 'I remember we had popcorn and you fell asleep halfway through...',
      successMessage: 'Perfect memory! Even if we didn\'t finish it, it was the best night. 🍿🎬',
      points: 20,
    },
    {
      id: 'heart-10',
      type: 'text-input',
      question: 'What is the "Monica Approved" meal that I cook for you that you love the most?',
      correctAnswer: 'Pasta', // Replace with her favorite meal you cook
      acceptableAnswers: ['homemade pasta', 'spaghetti'],
      placeholder: 'Name the dish...',
      hint: 'It’s your favorite thing to eat on a Sunday evening.',
      successMessage: 'Seven-star rating from the best critic! Bon Appétit! 🍝🍷',
      points: 20,
    },
    {
      id: 'heart-11',
      type: 'image-reveal',
      imageUrl: '/puzzles/heart/first-trip.jpg',
      imageAlt: 'A beautiful landscape from your first vacation',
      question: 'This was our very first trip together. What city were we in?',
      correctAnswer: 'Miami', // Replace with your first trip city
      acceptableAnswers: ['miami'],
      successMessage: 'I’d travel anywhere in the world as long as it’s with you. ✈️🌍',
      points: 25,
    },
    {
      id: 'heart-12',
      type: 'multiple-choice',
      question: 'What was the color of the very first flowers I ever bought for you?',
      options: ['Classic Red', 'Sunlight Yellow', 'Soft Pink', 'Pure White'],
      correctAnswer: 2, // Update to the real color
      successMessage: 'You remember! Just like those flowers, our love keeps blooming. 🌸',
      points: 15,
    },

    // --- HARD: THE LITTLE DETAILS ---
    {
      id: 'heart-13',
      type: 'text-input',
      question: 'What is the name of the first digital print we "published" on The Pixel Prince?',
      correctAnswer: 'Abstract Love', // Replace with the actual first print name
      acceptableAnswers: ['abstract love'],
      placeholder: 'Type the print title...',
      hint: 'It was the start of our digital art journey.',
      successMessage: 'The Pixel Prince found his Princess that day! 🎨👑',
      points: 30,
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
    },
    {
      id: 'heart-15',
      type: 'multiple-choice',
      question: 'Who said "I Love You" first?',
      options: ['Kenny', 'Sweetheart', 'We said it at the same time!', 'The Cat'],
      correctAnswer: 0, // Be honest, Kenny! 
      hint: 'It was a very nervous moment...',
      successMessage: 'And I haven\'t stopped saying it since. ❤️',
      points: 20,
    },

    // --- FUN & WARM: INSIDE JOKES ---
    {
      id: 'heart-16',
      type: 'text-input',
      question: 'If we were a "Friends" couple, who would we be?',
      correctAnswer: 'Monica and Chandler',
      acceptableAnswers: ['monica and chandler', 'chandler and monica', 'mondler'],
      placeholder: 'The best TV couple...',
      hint: 'The competitive chef and the funny data guy!',
      successMessage: 'Exactly! I’m so glad you’re my person. 💜☕',
      points: 15,
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
    },
    {
      id: 'heart-18',
      type: 'multiple-choice',
      question: 'What is the one thing I always "lose" that you always find for me?',
      options: ['My Keys', 'My Phone', 'My Glasses', 'My Mind'],
      correctAnswer: 1, // Update to your most lost item
      successMessage: 'Thank you for always being my "Internal GPS." 🧭❤️',
      points: 15,
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
    },

    // --- WRAPPING UP: FUTURE & FEELINGS ---
    {
      id: 'heart-21',
      type: 'multiple-choice',
      question: 'Where is our "Dream Destination" for our 10th anniversary?',
      options: ['Japan', 'Italy', 'Paris', 'The Maldives'],
      correctAnswer: 0, // Update to her dream trip
      successMessage: 'Pack your bags, because I’m making it happen! 🇯🇵✈️',
      points: 25,
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
    },
    {
      id: 'heart-24',
      type: 'multiple-choice',
      question: 'How many days have we been married (approx)?',
      options: ['500', '1000', '1500', 'Not enough!'],
      correctAnswer: 3,
      successMessage: 'Every day is a gift with you. 🎁❤️',
      points: 10,
    },
    {
      id: 'heart-25',
      type: 'text-input',
      question: 'Finish this sentence: "To the moon and..."',
      correctAnswer: 'Back',
      acceptableAnswers: ['back again'],
      placeholder: 'Complete the phrase...',
      successMessage: 'And even further than that. Happy Birthday, my love! 🌙✨',
      points: 10,
    },
  ],
};
