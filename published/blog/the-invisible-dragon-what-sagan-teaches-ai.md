---
title: "The Invisible Dragon: What Sagan's Garage Teaches Us About AI"
title_zh: "隐龙：萨根的车库龙教会我们什么"
slug: the-invisible-dragon-what-sagan-teaches-ai
date: 2026-04-16
tags: [loss-function, evaluation, sagan, invisible-dragon]
language: en
series: the-lexicon
wiki_sources:
  - bridges/invisible-dragon-is-loss-function
status: published
og_description: "Carl Sagan's invisible dragon parable explains why the hardest problem in AI isn't building smarter models — it's defining what 'good' means."
---

# The Invisible Dragon: What Sagan's Garage Teaches Us About AI

"There's a dragon in my garage."

Carl Sagan opens one of the sharpest thought experiments in modern philosophy with this line. You want to see it? The dragon is invisible. Spray-paint the floor to capture footprints? It floats. Use an infrared sensor to detect its fire? The fire is heatless. Every test you propose, Sagan parries. The dragon is unfalsifiable. And his conclusion is devastating: a dragon you cannot detect in any way is indistinguishable from no dragon at all.

Most people know this parable as a lesson about scientific skepticism. *The Fifth Dimension* sees something else in it entirely -- something that cuts to the heart of how artificial intelligence works.

## The Ruler Comes First

Here is a fact about machine learning that is technically obvious but philosophically profound: in AI, measurement comes before ability.

In ordinary life, the sequence runs the other way. A student learns mathematics, then takes an exam. First the skill, then the test. But AI inverts this. Before a model can learn anything, someone must define what "good" looks like -- must build a mathematical ruler that can score every output the model produces. Without that ruler, the model has no gradient to follow. No loss function, no learning. The measuring standard comes first, and ability grows to fit it.

The invisible dragon makes this vivid. If you cannot define "good" -- if your ruler is invisible, heatless, floating -- then the model cannot learn. The dragon might as well not exist.

This is not merely an engineering constraint. It is a statement about the nature of intelligence itself.

## How We Define Good Determines What We Get

Think about what this means in practice.

A model optimized for engagement learns to be addictive. A model optimized for accuracy learns to be cautious. A model optimized for helpfulness learns to agree with you -- unless "helpful" has been defined with extraordinary care. The loss function is not a thermometer passively reading the temperature of the model's performance. It is the force that shapes the weather.

The book captures this in a line worth sitting with: "The person who writes the exam holds the steering wheel of evolution. The exam does not screen for existing abilities -- it determines what abilities will be created."

Read that again. The exam does not screen for existing abilities. It determines what abilities will be created. This is a Copernican inversion of how most people think about evaluation. We assume tests reveal what is already there. In AI, tests create what will come to exist. The ruler is not passive. The ruler is generative.

This matters enormously for anyone trying to understand why AI systems behave the way they do. When a chatbot gives you a sycophantic answer, the question is not "why is the model sycophantic?" The question is: "what ruler rewarded sycophancy?" When a recommendation algorithm traps you in a filter bubble, the question is not about the algorithm's bias. It is about the loss function's definition of "relevant." Every behavior traces back to a measurement decision someone made -- often implicitly, often without fully understanding the consequences.

## The Verification Asymmetry

The invisible dragon illuminates something even deeper when you extend the metaphor beyond model training into the human world.

Some dragons are easy to detect. Code either compiles or it does not. A math problem either yields the correct answer or it does not. Short feedback loop, clear signal, measurable dragon. These are precisely the domains where AI advances fastest, because the ruler is obvious and the gradient is strong.

Other dragons are genuinely hard to measure. Was that strategic decision wise? You might not know for five years. Is this essay beautiful? A hundred readers will give you a hundred answers. Does this person have good judgment? How would you even construct the test?

The book calls this the verification asymmetry, and it is one of its most consequential ideas. The faster you can verify an output, the faster AI can learn to produce it -- and the sooner the human skill behind it loses its scarcity value. The slower the verification, the fuzzier the signal, the longer human advantage endures.

This reframes the entire conversation about which skills matter in the age of AI. It is not about which skills are "creative" versus "routine." It is about which skills have rulers and which do not. A graphic designer producing standard layouts operates in a domain with fast verification -- the client says yes or no, A/B tests measure clicks. That dragon is visible. But the designer who shapes a brand's identity over years, whose work can only be evaluated in retrospect and through the lens of culture and context -- that dragon is harder to see, harder to measure. And therefore harder to automate.

## Learning to See the Ruler

Here is the unsettling part: the invisible dragon is not confined to machine learning.

It is in every benchmark that decides which AI lab is "winning." It is in every RLHF reward model that shapes how a chatbot talks to you. It is in every job performance review that determines who gets promoted. It is in every college admissions rubric, every content moderation policy, every recommendation algorithm. Rulers are everywhere, and most of them are invisible -- not because they are secret, but because we have stopped noticing them.

The book's invitation is to start noticing.

When you interact with an AI system and wonder why it behaves the way it does, ask: what was the ruler? When you evaluate your own skills and wonder what to invest in next, ask: how easy is this to measure? When you see a benchmark ranking and feel the pull of consensus, ask: what does this ruler choose not to see?

A dragon that cannot be measured might as well not exist. But the reverse is equally true: the things that *can* be measured will dominate the system's attention, whether or not they are the things that matter most.

The first step to understanding AI is not learning how neural networks work. It is learning to see the ruler. Everything else follows from there.
