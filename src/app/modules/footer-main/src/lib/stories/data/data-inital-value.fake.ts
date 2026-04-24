import { LinkTarget } from '@dcx/ui/libs';

import type { FooterMainConfig } from '../../models/footer-main.config';

export const DATA_INITIAL_VALUE: FooterMainConfig = {
  logo: {
    link: {
      url: '/home',
      title: 'Home',
    },
    src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTY5IiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTY5IDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfODAyXzkyODgpIj4KPHBhdGggZD0iTTQzLjE5IDQuNDA4NzRDNDEuNTIxMiA0LjQwODc0IDQwLjE2IDUuNzM2ODEgNDAuMTYgNy4zNjQ3OEM0MC4xNiA4Ljk5Mjc0IDQxLjQ5IDEwLjM1MzkgNDMuMTkgMTAuMzUzOUM0NC44OTAxIDEwLjM1MzkgNDYuMjU5IDkuMDE2MTEgNDYuMjU5IDcuMzY0NzhDNDYuMjU5IDUuNzEzNDQgNDQuOTExNSA0LjQwODc0IDQzLjE5IDQuNDA4NzRaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIzLjc5OCAxOS4yNzg1QzEyMy43OTggMTQuNDM3NSAxMjEuMjI5IDEyLjA4OSAxMTUuOTUyIDEyLjA4OUMxMTIuOTg0IDEyLjA4OSAxMTAuMjgzIDEyLjkyNjMgMTA4LjE0OSAxNC4zNDJMMTA5Ljk1NCAxNy44MDI0QzExMS42ODEgMTYuNzU2NyAxMTMuMjQ1IDE2LjI3OTYgMTE0Ljg1NSAxNi4yNzk2QzExNi40NjYgMTYuMjc5NiAxMTguMzkgMTYuNzk3NiAxMTguMzkgMTkuMjgwNVYxOS41NDUzTDExNS4yMTIgMTkuNjU2M0MxMDkuOTcgMTkuODMzNSAxMDYuOTU3IDIyLjIwMzQgMTA2Ljk1NyAyNi4xNjYyQzEwNi45NTcgMzAuMTI5IDEwOS42NDEgMzIuNTU1NCAxMTMuNDczIDMyLjU1NTRDMTE1LjU5NyAzMi41NTU0IDExNy4zOTcgMzEuOTEyOCAxMTguOTY0IDMwLjU4NDdDMTE5LjM1MiAzMS42MzA0IDExOS44NjIgMzIuMTUyMyAxMjEuMTcxIDMyLjE1MjNIMTI0LjI0NEMxMjMuOTQ0IDMxLjEzNzcgMTIzLjc5NiAyOS45NzcxIDEyMy43OTYgMjguMjUxOFYxOS4yNzg1SDEyMy43OThaTTExOC4zOTIgMjcuMTUzNUMxMTcuNTIzIDI3Ljg3NiAxMTYuNDQ2IDI4LjI0NCAxMTUuMTczIDI4LjI0NEMxMTMuMzcgMjguMjQ0IDExMi4yOTMgMjcuMzM0NiAxMTIuMjkzIDI1LjgwMDFDMTEyLjI5MyAyNC44MzYyIDExMi42NTkgMjMuNTQxMiAxMTUuODcgMjMuNDQxOUwxMTguMzkyIDIzLjM2NzlWMjcuMTU1NFYyNy4xNTM1WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQwLjUyNjEgMzIuMTUyM0g0NS44NTZWMzAuMjU5NVYxMi41MzFINDAuNTI2MVYzMi4xNTIzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTI4LjkwMjYgMzIuMTUyM0gzMC43NTI1TDM4LjkxOTYgMTIuNTI5MUgzMy41ODk4TDI4Ljg0OCAyNS4yNDUxTDI0LjE4NjEgMTIuNTI5MUgxOC44MjEzTDI1Ljk4NTUgMzAuMDE4QzI2LjUzMDcgMzEuMzcxNCAyNy4zNTA1IDMyLjE1MjMgMjguOTA0NSAzMi4xNTIzSDI4LjkwMjZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNODYuNzM4MSAzMi4xNTIzVjE5LjIwNDVDODYuNzM4MSAxMy45NTQ1IDgzLjQ5MzggMTIuMDg5IDgwLjQ2MTggMTIuMDg5Qzc4LjE3NTcgMTIuMDg5IDc2LjEzMjkgMTIuODE1MyA3My44NzIxIDE0LjQ0MTRMNzMuODQ0OCAxNC4zNDAxQzczLjM5NyAxMy4xMjY5IDcyLjQzMyAxMi41MzEgNzAuODc5MSAxMi41MzFINjguODQ0MVYzMi4xNTQySDc0LjE2NjFWMTguNjMwMUM3NS44ODU2IDE3LjM0NjggNzcuMzk2OCAxNi43MjU2IDc4LjgwMjcgMTYuNzI1NkM4MC42MDAxIDE2LjcyNTYgODEuNDA0NCAxNy45MzQ5IDgxLjQwNDQgMjAuNjU5MlYzMi4xNTIzSDg2LjczODFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTA1LjgyNiAzMC41Mzc5TDEwNC40MyAyNi43NDg0QzEwMy4zMTIgMjcuMzk2OSAxMDEuNjkgMjguMTY2MSA5OS43ODcxIDI4LjE2NjFDOTUuODM0IDI4LjE2NjEgOTQuNDM1OSAyNC45NDkxIDk0LjQzNTkgMjIuMTk3NUM5NC40MzU5IDE4Ljc2NjQgOTYuNzA0NSAxNi4yNzc3IDk5LjgyOCAxNi4yNzc3QzEwMS42NDUgMTYuMjc3NyAxMDMuNDA5IDE2Ljg3MzYgMTA0Ljc5NCAxNy45MTU0TDEwNC45NzEgMTMuNTI4MUMxMDMuMjY3IDEyLjU3NTggMTAxLjQ3NyAxMi4wODcgOTkuMjYzMyAxMi4wODdDOTYuNDM3NyAxMi4wODcgOTMuODU1NiAxMy4xMzI4IDkxLjk5OTggMTUuMDMxNEM5MC4xMzAzIDE2LjkzIDg5LjEwNiAxOS41NjA5IDg5LjEwNiAyMi40NDFDODkuMTA2IDI1LjMyMTEgODkuOTc4NCAyNy43NjQ5IDkxLjU0OTkgMjkuNTUyNkM5My4yNjc1IDMxLjUxOTQgOTUuNzczNyAzMi41NTM0IDk4Ljc3NjQgMzIuNTUzNEMxMDEuNTk0IDMyLjU1MzQgMTA0LjQwOCAzMS41MDc3IDEwNS44MjggMzAuNTM2TDEwNS44MjYgMzAuNTM3OVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik02NS43NzMyIDMyLjE1MjNDNjUuNDczMyAzMS4xMzc3IDY1LjMyMTQgMjkuOTc3MSA2NS4zMjE0IDI4LjI1MThWMTkuMjc4NUM2NS4zMjE0IDE0LjQzNzUgNjIuNzUyOSAxMi4wODkgNTcuNDY5OCAxMi4wODlDNTQuNTA3OSAxMi4wODkgNTEuODA4OSAxMi45MjYzIDQ5LjY3MDcgMTQuMzQyTDUxLjQ3NTkgMTcuODAyNEM1My4yMDcxIDE2Ljc1NjcgNTQuNzY4OCAxNi4yNzk2IDU2LjM3MzQgMTYuMjc5NkM1Ny45NzggMTYuMjc5NiA1OS45MTE3IDE2Ljc5NzYgNTkuOTExNyAxOS4yODA1VjE5LjU0NTNMNTYuNzMzNyAxOS42NTYzQzUxLjQ5MzQgMTkuODMzNSA0OC40ODQ4IDIyLjIwMzQgNDguNDg0OCAyNi4xNjYyQzQ4LjQ4NDggMzAuMTI5IDUxLjE2NjMgMzIuNTU1NCA1NC45OTg2IDMyLjU1NTRDNTcuMTI3MSAzMi41NTU0IDU4LjkxODYgMzEuOTEyOCA2MC40ODgxIDMwLjU4NDdDNjAuODgzNCAzMS42MzA0IDYxLjM4NzggMzIuMTUyMyA2Mi43MDAzIDMyLjE1MjNINjUuNzczMlpNNTkuOTE1NiAyNy4xNTM1QzU5LjA1MSAyNy44NzYgNTcuOTY2MyAyOC4yNDQgNTYuNzAyNSAyOC4yNDRDNTQuODk1NCAyOC4yNDQgNTMuODE4NSAyNy4zMzQ2IDUzLjgxODUgMjUuODAwMUM1My44MTg1IDI0LjgzNjIgNTQuMTg0NiAyMy41NDEyIDU3LjM5NzcgMjMuNDQxOUw1OS45MTU2IDIzLjM2NzlWMjcuMTU1NFYyNy4xNTM1WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE3Ljc0MDUgMzIuMTUyM0MxNy40NDA2IDMxLjEzNzcgMTcuMjg4NyAyOS45NzcxIDE3LjI4ODcgMjguMjUxOFYxOS4yNzg1QzE3LjI4ODcgMTQuNDM3NSAxNC43MjAyIDEyLjA4OSA5LjQzNzA4IDEyLjA4OUM2LjQ3NTIgMTIuMDg5IDMuNzc2MjEgMTIuOTI2MyAxLjYzODA0IDE0LjM0MkwzLjQ0MzIxIDE3LjgwMjRDNS4xNzQzOSAxNi43NTY3IDYuNzM2MTQgMTYuMjc5NiA4LjM0MDc0IDE2LjI3OTZDOS45NDUzMyAxNi4yNzk2IDExLjg3OSAxNi43OTc2IDExLjg3OSAxOS4yODA1VjE5LjU0NTNMOC43MDA5OSAxOS42NTYzQzMuNDYyNjkgMTkuODMzNSAwLjQ1NDA3MSAyMi4yMDM0IDAuNDU0MDcxIDI2LjE2NjJDMC40NTQwNzEgMzAuMTI5IDMuMTM1NTQgMzIuNTU1NCA2Ljk2Nzg3IDMyLjU1NTRDOS4wOTYzIDMyLjU1NTQgMTAuODg3OCAzMS45MTI4IDEyLjQ1NzQgMzAuNTg0N0MxMi44NTI3IDMxLjYzMDQgMTMuMzU3IDMyLjE1MjMgMTQuNjY5NSAzMi4xNTIzSDE3Ljc0MjRIMTcuNzQwNVpNMTEuODgyOSAyNy4xNTM1QzExLjAxODMgMjcuODc2IDkuOTMzNjUgMjguMjQ0IDguNjY5ODMgMjguMjQ0QzYuODYyNzIgMjguMjQ0IDUuNzg1ODUgMjcuMzM0NiA1Ljc4NTg1IDI1LjgwMDFDNS43ODU4NSAyNC44MzYyIDYuMTUxOTQgMjMuNTQxMiA5LjM2NTAzIDIzLjQ0MTlMMTEuODgyOSAyMy4zNjc5VjI3LjE1NTRWMjcuMTUzNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNTQuNDY3IDMxLjI1NjVIMTU4LjE1MkMxNTkuNjggMzEuMjU2NSAxNjAuMzU4IDMxLjM4MzEgMTYwLjc4NCAzMS41NzU5QzE2MC4xMyAyOS41NDQ4IDE1OC4wNjggMjcuOTYxNiAxNTAuODAxIDI3LjQxODNDMTUxLjk2MSAyOC43NjIgMTUzLjE4IDMwLjA0OTIgMTU0LjQ2NSAzMS4yNTY1SDE1NC40NjdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTUwLjgwMSAyNy40MjAzQzE0My43NDcgMTkuMjI0IDEzOC45OTYgOC43Mzc2NSAxMzcuMDkxIDBDMTM3LjA5MSAwIDEzMy4yMTQgMy40MTk1IDEzMi45MDcgMTAuNjExQzEzMi41NjYgMTguNDcwNCAxMzYuNzgyIDI2LjM5NCAxNTAuNjY2IDI3LjQwNDdDMTUwLjcxMSAyNy40MTI1IDE1MC43NTggMjcuNDEyNSAxNTAuODAxIDI3LjQxODNWMjcuNDIwM1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNTQuNDY1IDMxLjI1NjVDMTQ4Ljk5MSAzMS4yNTY1IDEzOS41NDEgMzEuMjU2NSAxMzkuNTQxIDMxLjI1NjVDMTM5Ljc0IDMxLjcyIDE0MC40MjMgMzIuMDQ1MiAxNDEuOTc5IDMyLjEzNjdDMTUxLjI5NSAzMi42ODk3IDE1Mi42MTQgNDAgMTY1Ljk0NyA0MEMxNjcuMTE3IDQwIDE2Ny44NDcgMzkuOTI5OSAxNjguNTg1IDM5Ljc5MTZDMTYzLjMxNiAzOC4xNzE1IDE1OC41ODQgMzUuMTI1OCAxNTQuNDY1IDMxLjI1NDZWMzEuMjU2NVoiIGZpbGw9IndoaXRlIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfODAyXzkyODgiPgo8cmVjdCB3aWR0aD0iMTY4LjEzMSIgaGVpZ2h0PSI0MCIgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuNDU0MDcxKSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=',
  },
  columns: [
    {
      title: 'Discover and buy',
      items: [
        { title: 'Cheap flights', url: '/Cheap' },
        {
          title: 'Hotel reservations',
          url: 'https://sp.booking.com/dealspage.html?aid=2434507&label=hotels_shortcut',
          target: LinkTarget.BLANK,
        },
        {
          title: 'Car rentals',
          url: 'https://www.rentalcars.com/?affiliateCode=avianca695&adplat=cardlandingpage',
          target: LinkTarget.BLANK,
        },
      ],
    },
    {
      title: 'Company',
      items: [
        { title: 'About Us', url: '/about' },
        { title: 'Careers', url: 'https://careers.com', target: LinkTarget.BLANK },
        { title: 'Press', url: '/press' },
      ],
    },
    {
      title: 'Support',
      items: [
        { title: 'Help Center', url: '/help' },
        { title: 'Contact Us', url: '/contact' },
        { title: 'FAQ', url: '/faq' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { title: 'Privacy Policy', url: '/privacy' },
        { title: 'Terms of Service', url: '/terms' },
        { title: 'Cookies Policy', url: '/cookies' },
      ],
    },
  ],
  socialMedia: {
    title: '¡Síguenos!',
    items: [
      { name: 'Facebook', link: { url: 'https://facebook.com' } },
      { name: 'Twitter', link: { url: 'https://twitter.com' } },
      { name: 'LinkedIn', link: { url: 'https://linkedin.com' } },
      { name: 'Instagram', link: { url: 'https://instagram.com' } },
    ],
  },
  copyright: {
    title: 'Copyright © Avianca 2025',
  },
  partners: [
    {
      link: {
        url: 'https://www.aerocivil.gov.co/',
        title: 'Aeronáutica Civil',
        target: LinkTarget.BLANK,
      },
      image: {
        src: '//static.avianca.com/media/1234/aeronautica-logopng.png',
        altText: 'Logo Aeronáutica Civil',
      },
      width: 105,
    },
    {
      link: {
        url: 'https://www.staralliance.com/',
        title: 'Star Alliance',
        target: LinkTarget.BLANK,
      },
      image: {
        src: '//static.avianca.com/media/1232/star-alliance-logo.svg',
        altText: 'Logo Star Alliance',
      },
      width: 120,
    },
    {
      link: {
        url: 'https://www.supertransporte.gov.co/',
        title: 'Superintendencia de Transporte',
        target: LinkTarget.BLANK,
      },
      image: {
        src: '//static.avianca.com/media/cuioqxuv/super-transporte-logosvg.svg',
        altText: 'Logo SuperTransporte',
      },
      width: 105,
    },
  ],
};
