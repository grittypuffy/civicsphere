---
title: Philosophy - CivicSphere Docs
description: The guiding philosophy for CivicSphere
---

# Philosophy

The design and development of CivicSphere is guided by the following principles:

# Accessibility and inclusion is a mindset

It's nice to implement accessibility than preach about it.

It goes beyond testing application with screen readers or using Lighthouse for metrics. It is a mindset that ensures the platform is centered around users.

CivicSphere aims to cater to the invisible majority including:

- Visual impairments of different degrees (low vision, color blindness, blindness)
- Hard of hearing and speech population
- People with intellectual disabilities
- Neurodiverse population and people with sensory processing disorders
- People who speak languages other than English
- People from third-world or developing countries with poorer network access

As of now, we have only touched on people with visual impairments and people from developing nations since we can validate accessibiity for them real-time. We would love to make the platform accessible for the above mentioned population using universal design principles.

# Less is more

We aim to build an integrated solution with less features over including more features without:

- Accessibility
- Internationalization
- Localization
- Security

which means we have to be intentional between being robust and usable by general public.

That's one of the reasons behind not integrating features that might take a toll on the above stated factors such as:

- Heavy visualizations or multimedia content
- Interactive maps
- Integration of external news feed since the content might pose accessibility concerns

# Protect user interests

Strike balance between personalization and user privacy by ensuring content is delivered based on user interests over user profiling to ensure their political interests aren't being misused.

We don't collect or analyze user's personal data to ensure privacy and delete user uploaded content to agents in an automated manner.

We leverage PII sanitization to ensure sensitive information isn't passed away to external services such as AI agents or third-party integrations.

# Collaboration-first mentality

CivicSphere is rooted in the spirits of the community and the free software movement.

We work on GitHub and encourage contributions in terms of:

- Ideas
- Code
- Design
- Documentation
- Data
- Accessibility feedback and user experience feedback

# Facilitate civil and constructive discussions

CivicSphere is developed to aid constructive, inclusive and thoughtful political issues in local communiities.

In spirit of that, we aim to adopt the same approach for our collaboration and development practice to ensure sustainability of the project.