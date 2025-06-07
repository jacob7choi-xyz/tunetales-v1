# TuneTales

A modern web application that brings music stories to life through beautiful animations and interactive storytelling. Built with Next.js 14, Tailwind CSS, and Framer Motion.

## Features

- 🎵 Dynamic floating music notes animation
- 🎨 Beautiful, responsive UI with Tailwind CSS
- ⚡ Fast page loads with Next.js 14
- 🎭 Smooth animations with Framer Motion
- 📱 Mobile-first design
- 🌙 Dark theme optimized
- 🎯 SEO-friendly
- 🚀 Performance optimized

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tunetales.git
   cd tunetales
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tunetales/
├── app/
│   ├── components/
│   │   ├── FloatingNote.tsx
│   │   ├── FloatingNotesLayer.tsx
│   │   └── StoryCard.tsx
│   ├── stories/
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── loading.tsx
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   └── grid.svg
├── tailwind.config.ts
└── package.json
```

## Performance Optimizations

- Memoized components and calculations
- Pre-computed random values pool
- Hardware-accelerated animations
- Optimized image loading
- Reduced animation complexity
- Efficient DOM updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Heroicons](https://heroicons.com/)
