---
schema_version: 1
document_type: usage
id: storytelling.blog-posts-carousel
group: storytelling
family: blog-posts-carousel
variant: blog-posts-carousel
status: ready
summary: Configuration reference for the Blog Posts Carousel horizontal scrolling section.
tags:
  - storytelling
  - blog-posts-carousel
  - carousel
  - settings
  - configuration
---

# Blog Posts Carousel Usage

Configuration guidance for the Blog Posts Carousel section matching the clean editorial peek layout.

## Purpose

Showcase editorial articles and journal stories in a compact, touch-friendly horizontal track that shows 3 full cards on desktop with the 4th card peeking from the edge to invite horizontal exploration without overwhelming page height.

## Physical composition

- **Header:** Section headline, optional "View all" link, and minimal circular previous/next navigation arrow buttons.
- **Carousel Track:** Smooth scroll-snap container with touch-swipe, mouse-wheel, and keyboard accessibility.
- **Card Anatomy:**
  - Neutral square/landscape media box with subtle rounded corners (`12px`).
  - Prominent article title.
  - Formatted "Date | Author" meta line separated by a clean vertical bar.
  - Concise excerpt text with two-line clamping.

## Schema settings reference

### Section settings

| Setting                  | Type     | Default              | Description                                              |
| ------------------------ | -------- | -------------------- | -------------------------------------------------------- |
| `title`                  | text     | `"From the Journal"` | Section heading text                                     |
| `blog`                   | blog     | `blank`              | Shopify Blog source to pull articles from                |
| `post_limit`             | range    | `6`                  | Maximum number of articles to render in the carousel     |
| `media_aspect_ratio`     | select   | `"square"`           | Frame ratio (`square`, `landscape`, `portrait`, `adapt`) |
| `media_radius`           | range    | `12px`               | Corner radius of the media container                     |
| `media_background`       | color    | `#f0f2f4`            | Background of the media container frame                  |
| `show_date`              | checkbox | `true`               | Toggle publication date visibility                       |
| `show_author`            | checkbox | `true`               | Toggle author visibility                                 |
| `show_excerpt`           | checkbox | `true`               | Toggle excerpt description visibility                    |
| `show_view_all`          | checkbox | `true`               | Show link to full blog index                             |
| `show_navigation_arrows` | checkbox | `true`               | Show previous / next arrow buttons in header             |
| `page_width`             | range    | `1300px`             | Maximum container width                                  |
| `padding_top`            | range    | `56px`               | Top padding                                              |
| `padding_bottom`         | range    | `56px`               | Bottom padding                                           |
