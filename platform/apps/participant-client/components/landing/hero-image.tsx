"use client"

export default function HeroImage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto overflow-hidden rounded-2xl">
      <div className="w-full bg-black overflow-hidden rounded-2xl">
        <img
          src="/images/design-mode/hero-image.jpg.jpeg"
          alt="YOYO AI Version Control timeline with instant code restore"
          className="w-full h-auto object-cover"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  )
}
