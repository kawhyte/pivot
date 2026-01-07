# 💝 Heart Path Customization Guide

This guide will help you personalize the **Heart Path** puzzles with your real relationship memories!

## 📍 File Location
`/data/puzzles/heart.ts`

## 🎯 Puzzles to Customize

### Puzzle 1: First Date Location
```typescript
{
  question: 'Where did we have our first date?',
  correctAnswer: 'The Coffee House', // ⚠️ REPLACE THIS
  acceptableAnswers: ['coffee house', 'the coffee shop'],
  hint: 'Remember that cozy spot where we talked for hours?',
}
```

**Action Items:**
- [ ] Update `correctAnswer` with the actual location
- [ ] Update `acceptableAnswers` with variations (lowercase, with/without "the", etc.)
- [ ] Customize the `hint` to be more specific to your memory
- [ ] Update `successMessage` if desired

---

### Puzzle 2: First Dance Song
```typescript
{
  question: 'What song was playing during our first dance?',
  options: [
    'Perfect by Ed Sheeran',      // Index 0
    'At Last by Etta James',      // Index 1
    'Thinking Out Loud by Ed Sheeran', // Index 2
    'All of Me by John Legend'    // Index 3
  ],
  correctAnswer: 1, // ⚠️ UPDATE THIS INDEX
}
```

**Action Items:**
- [ ] Replace all 4 `options` with 4 meaningful songs (include your actual song + 3 decoys)
- [ ] Update `correctAnswer` to the correct index (0, 1, 2, or 3)
- [ ] Customize the `hint` with a specific memory

---

### Puzzle 3: Special Nickname
```typescript
{
  question: 'What\'s my special nickname for you?',
  correctAnswer: 'Sweetheart', // ⚠️ REPLACE THIS
  acceptableAnswers: ['sweet heart', 'sweetie'],
}
```

**Action Items:**
- [ ] Update `correctAnswer` with your actual pet name for her
- [ ] Add variations to `acceptableAnswers` (different spellings, abbreviations)
- [ ] Update the `hint` to be more personal

---

### Puzzle 4: Engagement Month
```typescript
{
  question: 'In which month did we get engaged?',
  options: ['June', 'September', 'December', 'February'],
  correctAnswer: 2, // ⚠️ UPDATE THIS (December = index 2)
}
```

**Action Items:**
- [ ] Update `options` with 4 months (include your actual month + 3 decoys)
- [ ] Update `correctAnswer` to the correct index
- [ ] Optionally change to ask about wedding month, anniversary, or other significant date
- [ ] Update the `hint` to reference the season or a detail about that day

---

### Puzzle 5: Special Place
```typescript
{
  question: 'What\'s our special place we always go back to?',
  correctAnswer: 'The Beach', // ⚠️ REPLACE THIS
  acceptableAnswers: ['beach', 'the beach', 'our beach'],
}
```

**Action Items:**
- [ ] Update `correctAnswer` with your actual special location
- [ ] Add variations to `acceptableAnswers`
- [ ] Customize the `hint` with a specific memory about that place

---

## 💡 Pro Tips

### Making Questions More Personal
Instead of generic questions, make them super specific:
- ❌ "Where did we have our first date?"
- ✅ "Where did we share our first kiss under the stars?"

### Success Messages
Make the success messages feel like you're talking directly to her:
- Include inside jokes
- Reference specific moments from that memory
- Add emoji that match the emotion of that moment

### Hints
Make hints that trigger specific memories:
- "You wore that blue dress I love"
- "It was raining, but we didn't care"
- "You ordered the same thing twice because you loved it so much"

---

## 🎨 Optional Enhancements

### Add More Puzzles
You can add more puzzles to the array! Just copy-paste a puzzle object and customize it:

```typescript
{
  id: 'heart-6',
  type: 'text-input',
  question: 'What was the first movie we watched together?',
  correctAnswer: 'The Notebook',
  acceptableAnswers: ['notebook', 'the notebook'],
  placeholder: 'Type the movie name...',
  hint: 'We both cried at the end!',
  successMessage: 'Yes! And we\'ve watched it 5 more times since! 🎬',
  points: 10,
},
```

### Use Image Puzzles
If you have photos, you can use the `image-reveal` type:

```typescript
{
  id: 'heart-special',
  type: 'image-reveal',
  question: 'Where was this photo taken?',
  imageUrl: '/images/our-special-place.jpg', // Add image to public/images/
  imageAlt: 'Our special moment',
  correctAnswer: 'Paris',
  acceptableAnswers: ['paris', 'eiffel tower'],
  hint: 'City of love!',
  successMessage: 'Yes! That trip was unforgettable! 🗼',
  points: 10,
}
```

---

## ✅ Testing Your Changes

1. Save your changes to `/data/puzzles/heart.ts`
2. Refresh your browser (the dev server auto-reloads)
3. Click on the **Heart** path
4. Test each puzzle to make sure:
   - The questions make sense
   - The answers work (including variations)
   - The hints are helpful
   - The success messages feel right

---

## 🎁 Final Checklist

Before the big day:
- [ ] All 5 puzzles customized with real memories
- [ ] Tested all answers (including variations)
- [ ] Success messages feel personal and romantic
- [ ] Hints trigger the right memories without giving it away
- [ ] No typos in questions or answers
- [ ] Images added (if using image-reveal puzzles)
- [ ] Changed START_DATE back to January 20, 2026 in `lib/daily-drop.ts`

---

Made with love ❤️
