import React from 'react'
import styles from './styles.module.scss'

// Placeholder colored images
// const placeholderImages = [
//   { color: '#3498db', id: 'image1' },  // Blue
//   { color: '#e74c3c', id: 'image2' },  // Red
//   { color: '#2ecc71', id: 'image3' },  // Green
//   { color: '#f39c12', id: 'image4' }   // Orange
// ]

const homepageImages = [
  '/img/homepage/1.png',
  '/img/homepage/2.png',
  '/img/homepage/3.png',
  '/img/homepage/4.png',
]

function Hero() {
  return (
    <div className={styles.hero}>
      <div className={styles.bloghome__intro}>
        <h1 className={styles.hero_title}> GenAI / Computer Vision</h1>
        <p className={styles.hero_description}>
          Use AI to make life easier — Lower the threshold for people to attain happiness. 
          The time for learning is short, and there is so much that we don't know.
          Strive to create beautiful things.
        </p>
      </div>
      
      <div className={styles.imageGrid}>
        {homepageImages.map((src, idx) => (
          <div key={src} className={styles.gridImage}>
            <img src={src} alt={`homepage-${idx+1}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Hero
