import { ScrollPage } from './scroll/scroll'
import { Render } from './works/index'

import 'reset-css'

document.addEventListener('DOMContentLoaded', () => {
  const path = location.search.split('=')[1]
  console.log(path)
  new Render(path)

  console.log(location)
  new ScrollPage()
})
