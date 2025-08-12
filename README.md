# Palette Generator - Color Palette Generator

A powerful, client-side color palette extraction tool that generates professional color schemes from images and exports them for various applications including Microsoft Office, Power BI, and web development.

## Features

- **Image Upload**: Drag & drop, click to upload, or paste images directly
- **Smart Palette Extraction**: Uses k-means clustering to extract dominant colors
- **Multiple Extraction Styles**: Auto, Balanced, Vibrant, and Muted options
- **Color Harmonies**: Generate complementary, analogous, triadic, tetradic, and monochrome schemes
- **Theme Generation**: Create light and dark themes with customizable background strength
- **Multiple Export Formats**:
  - Power BI themes (.json)
  - Microsoft Office color schemes (.xml)
  - CSS variables
  - Palette PNG images
- **Real-time Preview**: See how your theme looks in UI components
- **Self-testing**: Built-in diagnostics to verify functionality

## Project Structure

```
Colour palette/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All CSS styles and variables
├── js/
│   └── app.js          # All JavaScript functionality
└── README.md           # This file
```

## How to Use

1. **Upload an Image**: Drag and drop an image file, click the upload area, or paste an image from your clipboard
2. **Extract Palette**: Choose the number of colors (3-12) and extraction style, then click "Extract Palette"
3. **Explore Harmonies**: Select a base color and harmony type to generate complementary color schemes
4. **Build Themes**: Choose between light/dark modes and background strength to create professional themes
5. **Export**: Download your color schemes in various formats for different applications

## Technical Details

- **Pure Client-side**: No server required, all processing happens in your browser
- **Canvas-based**: Uses HTML5 Canvas for image processing and palette extraction
- **K-means Clustering**: Advanced algorithm for intelligent color extraction
- **HSL Color Space**: Works with HSL for better color manipulation and harmony generation
- **Responsive Design**: Works on desktop and mobile devices

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Requires Canvas API support

## Local Development

To run this project locally:

1. Simply open `index.html` in a web browser
2. No build process or dependencies required
3. All functionality works offline

## Deployment

This project can be deployed to any static hosting service:

- **Netlify**: Drag and drop the folder
- **GitHub Pages**: Push to a repository and enable Pages
- **Vercel**: Import the folder as a static project
- **Any web server**: Upload the files to your hosting provider

## File Descriptions

- **`index.html`**: Clean HTML structure with semantic markup
- **`css/styles.css`**: Complete styling with CSS custom properties and responsive design
- **`js/app.js`**: Full application logic including image processing, color algorithms, and UI interactions

## Color Theory Features

- **Perceived Luminance**: Calculates how bright colors appear to human eyes
- **HSL Manipulation**: Precise control over hue, saturation, and lightness
- **Harmony Generation**: Mathematical color theory for professional color schemes
- **Accessibility**: Automatic contrast calculations for readable color combinations

## Export Formats

The Palette Generator supports multiple export formats optimized for different applications:

### Power BI Theme (.json)
```json
{
  "name": "Palette Generator Theme",
  "foreground": "#E7ECFF",
  "background": "#0E1230",
  "tableAccent": "#6EA8FE",
  "dataColors": ["#6EA8FE", "#22C55E", ...]
}
```
**Use case**: Import directly into Power BI for consistent data visualization colors.

### Office Theme (.thmx)
```xml
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Palette Generator Theme">
  <a:themeElements>
    <a:clrScheme name="Palette Generator Colors">
      <a:accent1><a:srgbClr val="6EA8FE"/></a:accent1>
      <a:accent2><a:srgbClr val="22C55E"/></a:accent2>
      <!-- ... more colors ... -->
    </a:clrScheme>
  </a:themeElements>
</a:theme>
```
**Use case**: Import directly into Word, PowerPoint, and Excel as a theme file.

### CSS Variables (.css)
```css
:root {
  --background: #0E1230;
  --foreground: #E7ECFF;
  --accent1: #6EA8FE;
  --accent2: #22C55E;
  --hyperlink: #6EA8FE;
  --followed: #4B9FE1;
}
```
**Use case**: Web development with CSS custom properties.

### Tailwind Config (.js)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "#0E1230",
        foreground: "#E7ECFF",
        accent1: "#6EA8FE",
        accent2: "#22C55E"
      }
    }
  }
}
```
**Use case**: Tailwind CSS projects for consistent design tokens.

### Figma Tokens (.json)
```json
{
  "Palette Generator": {
    "background": {
      "value": "#0E1230",
      "type": "color"
    },
    "accent1": {
      "value": "#6EA8FE",
      "type": "color"
    }
  }
}
```
**Use case**: Design systems in Figma with the Tokens plugin.

### Sketch Colors (.json)
```json
[
  { "name": "Background", "color": "#0E1230" },
  { "name": "Accent 1", "color": "#6EA8FE" }
]
```
**Use case**: Color palettes for Sketch design files.

## Contributing

This is a standalone tool, but suggestions and improvements are welcome. The code is well-commented and organized for easy modification.

## License

This project is open source and available for personal and commercial use.

---

Built with ❤️ using vanilla HTML, CSS, and JavaScript. No frameworks, no dependencies, just pure web technologies.
