import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

import '../styles/scroll.scss'

export class ScrollPage {
  constructor() {
    console.log('ScrollPage')
    gsap.registerPlugin(ScrollTrigger)

    const area = document.querySelector('.js-area')
    const wrap = document.querySelector('.js-wrap')
    const items = document.querySelectorAll('.js-item')
    const num = items.length

    gsap.set(wrap, { width: num * 100 + '%' })
    gsap.set(items, { width: 100 / num + '%' })

    gsap.to(items, {
      xPercent: -100 * (num - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: area,
        start: 'top top',
        end: 'bottom top',
        pin: true,
        scrub: true,
      },
    })
  }
}
