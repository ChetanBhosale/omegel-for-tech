/**
 * Blog posts. Stored as structured content so each post renders server side
 * and is fully indexable. Add new posts to this array.
 */

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date. */
  date: string;
  readingMinutes: number;
  tags: string[];
  sections: BlogSection[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "best-omegle-alternatives-for-developers",
    title: "The best Omegle alternative for developers in 2026",
    description:
      "Omegle is gone and most replacements are still a coin flip with strangers. Here is why a developer only room changes the whole experience.",
    date: "2026-02-10",
    readingMinutes: 5,
    tags: ["omegle alternative", "developers", "video chat"],
    sections: [
      {
        paragraphs: [
          "Omegle <a href=\"https://techcrunch.com/2023/11/08/omegle-shutdown-after-14-years/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"underline hover:text-foreground\">closed its doors in November 2023</a>, and the gap it left never really got filled. Millions of people still type 'sites like Omegle' into Google every month. Most of what they find is the same thing rebuilt: open the page, point your camera at the void, and hope the next person is not someone you have to skip in half a second.",
          "If you write code for a living, that format wastes your time. You do not want pure randomness. You want randomness with a floor under it, where the person on the other end is at least in the same world as you.",
        ],
      },
      {
        heading: "The problem with generic random chat",
        paragraphs: [
          "The classic random chat model has one structural flaw: it matches you with literally anyone. No shared context, no common ground, and a moderation problem that never goes away. That is exactly what got Omegle shut down.",
          "Adding interest tags helps a little, but tags are easy to fake and most people skip them. What actually filters a room is who is allowed in.",
        ],
      },
      {
        heading: "Why a GitHub gate fixes it",
        paragraphs: [
          "OmegleForTech only lets you in through GitHub sign in. That one decision does most of the work. The room fills with developers because you need a developer account to get there. Conversations start with something real already in common, whether that is the language you are learning, the bug you are stuck on, or the job you are interviewing for.",
          "It is still instant and still random. You click start, you get matched in seconds, and you can skip to the next person whenever you want. The difference is who you land on.",
        ],
      },
      {
        heading: "What you can actually use it for",
        paragraphs: [
          "Pair on a problem you have been staring at too long. Get a second opinion on an architecture choice. Practice talking through your work out loud before an interview. Meet someone building in the same space as you. Or just take a break and talk to another human who gets what you do all day.",
          "Sign in with GitHub, allow your camera, and you are in. That is the whole flow.",
        ],
      },
    ],
  },
  {
    slug: "how-to-network-with-developers-online",
    title: "How to actually network with developers online",
    description:
      "Conferences are expensive and Twitter is noise. Here is a faster way to meet other developers and have a real conversation.",
    date: "2026-02-18",
    readingMinutes: 4,
    tags: ["networking", "developers", "career"],
    sections: [
      {
        paragraphs: [
          "Most developer networking advice tells you to go to meetups, post on social media, and slide into DMs. That works for some people, but it is slow, and a lot of it is performance rather than conversation.",
          "Live video skips the small talk problem. You are face to face with another developer in seconds, and you both already know why you are there.",
        ],
      },
      {
        heading: "Lead with what you are working on",
        paragraphs: [
          "The fastest way into a good conversation is to say what you are building and what is currently breaking. Developers love a concrete problem. It turns a cold intro into a real exchange almost immediately.",
        ],
      },
      {
        heading: "Treat the skip button as a feature",
        paragraphs: [
          "Not every match will click, and that is fine. The whole point of random matching is that the cost of moving on is zero. Skip, get someone new, keep going until a conversation has legs.",
        ],
      },
      {
        heading: "Show up regularly",
        paragraphs: [
          "Networking compounds. Spending a few minutes a week talking to other builders adds up to a real sense of the field, what people are using, and who is working on what. That context is hard to get any other way.",
        ],
      },
    ],
  },
  {
    slug: "is-random-video-chat-safe",
    title: "Is random video chat safe, and how verification changes it",
    description:
      "Random video chat got a bad name for good reasons. Here is what made it risky and how a verified room is different.",
    date: "2026-02-24",
    readingMinutes: 4,
    tags: ["safety", "video chat", "moderation"],
    sections: [
      {
        paragraphs: [
          "The honest answer is that old school random video chat was not safe, and everyone knew it. Anyone could join, there was no accountability, and moderation was always one step behind. Omegle <a href=\"https://techcrunch.com/2023/11/08/omegle-shutdown-after-14-years/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"underline hover:text-foreground\">eventually shut down</a> over exactly these issues.",
        ],
      },
      {
        heading: "What made it risky",
        paragraphs: [
          "Total anonymity with zero barrier to entry is the core problem. When there is no account and no consequence, bad actors have nothing to lose. No amount of after the fact moderation fully solves that.",
        ],
      },
      {
        heading: "What a sign in requirement changes",
        paragraphs: [
          "Requiring GitHub sign in raises the floor. You are talking to people who have a real developer account tied to their identity, not a throwaway. It does not make the internet perfect, but it removes the easy anonymity that made the old model so messy.",
          "On top of that, calls run peer to peer over <a href=\"https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"underline hover:text-foreground\">WebRTC</a>, so your stream goes directly to the other person. We do not record calls.",
        ],
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
