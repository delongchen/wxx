---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "WxxDocs"
  text: "dev documents"
  actions:
    - theme: brand
      text: Wxx Core
      link: /core/index
    - theme: alt
      text: Wxx App
      link: /app/index
    - theme: alt
      text: LCU APIs
      link: /lcu-api/index
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/WxsbProject.png',
    name: 'WX',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/WxsbProject' },
    ]
  },
  {
    avatar: 'https://www.github.com/delongchen.png',
    name: 'd',
    title: 'Assistant',
    links: [
      { icon: 'github', link: 'https://github.com/delongchen' },
    ]
  },
  {
    avatar: 'https://www.github.com/a2670392079.png',
    name: 'mao',
    title: 'Assistant',
    links: [
      { icon: 'github', link: 'https://github.com/a2670392079' },
    ]
  },
]
</script>

# Our Team

<VPTeamMembers size="small" :members="members" />
