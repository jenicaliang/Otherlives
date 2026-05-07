// ============================================================
// STORY DATA
// Edit prose, bleed-throughs, and endings here.
// Structure: each key is a node ID referenced by engine.js
// ============================================================

const STORY = {

  // ----------------------------------------------------------------
  // TITLE
  // ----------------------------------------------------------------

  title: {
    type: 'title',
    next: 'n1'
  },

  // ----------------------------------------------------------------
  // ACT 1 — THE UNDIVIDED
  // Worldline: 1
  // No bleed-throughs yet — the soul hasn't split.
  // ----------------------------------------------------------------

  n1: {
    type: 'prose',
    bleeds: [],
    text: [
      "The sound of rain draws you back to the present.",
      "Now is no time for daydreams. The carpet beneath your feet is soft, worn thin in the places you always stand. The suitcase in front of you sits politely, packed and waiting. In it are your few possessions; together, they barely reach the top. A toothbrush. A couple of your favorite clothes. A stuffed rabbit.",
      "Vaguely, you are aware of the sound of the street outside, but it is distant, like you are underwater. The rain is louder. It fills the space around you, making you feel smaller and quieter and more separate from everything else.",
      "This sense of loss is at once familiar and foreign. You have felt it before, in other forms. You wonder if all of life is just made up of moments like this, one after another until the end.",
      "But even so, there exists a pull. Away from this place, away from the shape your life has taken here. And in this moment the pull is stronger than the absence not yet fully felt.",
      "The rain continues. You stay standing in silence."
    ],
    next: 'n2'
  },

  n2: {
    type: 'prose',
    bleeds: [],
    text: [
      "You have been in this room long enough to know its sounds. The particular creak of the radiator at night. The way sound carries from outside. The neighbor whose schedule you have memorized without meaning to.",
      "You will not miss these things. Or you will miss them terribly. You have not yet decided which is true, or if the decision is even yours to make.",
      "The suitcase is already packed. That, in itself, may be an answer.",
      "What you are doing is not brave, or adventurous, or unique. You know that. It is simply the thing your body has decided to do while your mind was elsewhere. And now here you are, coat on, keys in hand, the door just a couple steps away.",
      "The rain is quieter now. Almost finished."
    ],
    next: 'n3'
  },

  n3: {
    type: 'fork',
    bleeds: [],
    text: [
      "You pick up the suitcase. It is lighter than you expected.",
      "Your hands tighten around the handle."
    ],
    prompt: "Where do you go?",
    choices: [
      { label: "The seaside",  next: 'n3b', worldlineSuffix: '.1' },
      { label: "The city",     next: 'n3b', worldlineSuffix: '.2' }
    ]
  },

  // ----------------------------------------------------------------
  // SPLIT INTERSTITIAL
  // Appears immediately after Fork 1, before either branch begins.
  // Forces the player to discover the hold mechanic narratively.
  // The continue button is locked until the player has held once.
  // ----------------------------------------------------------------

  n3b: {
    type: 'split',
    text: [
      "You've made your decision.",
      "Something shifts.",
      "You cannot name what it is. It's like seeing yourself from someone else's eyes, or walking into a room and forgetting why you're there. You are the same person you were a moment ago. You are also not."
    ],
    bleed: {
      text: "what if i went the other way?\nwould i be happier, then?\ni guess that's what she's wondering, now.",
      top: '52%', left: '0%'
    },
    seasideNext: 'n4a',
    cityNext: 'n4b'
  },

  // ----------------------------------------------------------------
  // ACT 2 — TWO SHORES: SEASIDE BRANCH
  // Worldline: 1.1
  // ----------------------------------------------------------------

  n4a: {
    type: 'prose',
    bleeds: [
      {
        text: "it's quieter by the sea.\ni wonder if i would've liked that more.",
        top: '60%', left: '0%'
      }
    ],
    text: [
      "The seaside town receives you without ceremony.",
      "You find the address from memory — a small house at the edge where the road ends and the grass takes over, and beyond the grass, the cliff, and beyond the cliff, the water. You cannot see the water yet but you can smell it. Salt and cold and something older than both.",
      "The house has been empty for some time. You can tell by the quality of the silence — not quiet, exactly, but unoccupied. You set your suitcase down in the main room and stand there for a moment, listening to yourself breathe.",
      "There is a window that faces the sea. You don't look through it yet."
    ],
    next: 'n5a'
  },

  n5a: {
    type: 'prose',
    bleeds: [
      {
        text: "she lets them decide who she is.\ni used to do that too.",
        top: '28%', left: '2%'
      },
      {
        text: "the stew. even that.\ni wonder if she notices how much she accepts.",
        top: '68%', left: '-1%'
      }
    ],
    text: [
      "A neighbor comes by on the second day. She is older, practical, the kind of person who brings food as a form of conversation. She sets a covered dish on your table and looks around your kitchen as though assessing something.",
      "\"You're the one who took the Maren place,\" she says. Not a question.",
      "You say yes.",
      "She looks at you for a moment — not unkindly, but with the particular attention of someone who is deciding how much to know about you. Then she nods, as though you've confirmed something she already suspected, and leaves.",
      "You eat alone. The dish is a fish stew, simple and good. Outside, the sea is loud tonight. You had not noticed it being loud before.",
      "There is something you did not say. You are not yet sure what it was."
    ],
    next: 'n6a'
  },

  n6a: {
    type: 'fork',
    bleeds: [
      {
        text: "she's deciding again.\nshe thinks it's about honesty. it's not.",
        top: '18%', left: '1%'
      },
      {
        text: "i told the truth once.\nit didn't make me more real. just more visible.",
        top: '65%', left: '-2%'
      }
    ],
    text: [
      "The neighbor returns on the fourth day. This time she brings her grandson, a boy of about seven who immediately goes to look at your stuffed rabbit, sitting on the shelf where you placed it without thinking.",
      "\"Yours?\" the neighbor asks, watching him.",
      "\"Yes,\" you say.",
      "She accepts this. Then: \"Maren was a woman who kept to herself. People respected that. People will respect it in you too, if that's what you want.\"",
      "An identity, ready-made, waiting to be worn. You could become the person who took the Maren place. It would be easy. It would be a kind of answer.",
      "The boy sets the rabbit back carefully. He looks at you.",
      "Your hands are very still at your sides."
    ],
    prompt: "Do you tell her who you are?",
    choices: [
      { label: "Yes — \"That's not quite right. Let me explain.\"",  next: 'n7a1', worldlineSuffix: '.1' },
      { label: "No — you nod, and she takes it as agreement",        next: 'n7a2', worldlineSuffix: '.2' }
    ]
  },

  // Seaside + Truth
  n7a1: {
    type: 'prose',
    bleeds: [
      {
        text: "she told them. i didn't think she would.",
        top: '14%', left: '0%'
      },
      {
        text: "what does it feel like, to be known\nin a place you just arrived?\ni genuinely don't remember.",
        top: '48%', left: '-1%'
      },
      {
        text: "braver. or maybe just more tired of pretending.\ni can't decide which one i admire.",
        top: '76%', left: '2%'
      }
    ],
    text: [
      "You explain yourself simply. Not everything — just enough. Where you came from. Why you left. That you do not know how long you'll stay.",
      "The neighbor listens with her hands folded. She does not look surprised. When you finish, she says: \"That's a longer road than the Maren place usually gets.\"",
      "The boy has found a piece of string and is winding it around his fingers.",
      "Something loosens in your chest. Small, but real.",
      "You are still a stranger here. But you are a specific stranger now, not an empty one. There is a difference. You feel it in the way she looks at you — not as a shape to fill, but as a person to get used to.",
      "That night, you stand at the window that faces the sea. You look through it."
    ],
    next: 'n8a1'
  },

  // Seaside + Silence
  n7a2: {
    type: 'prose',
    bleeds: [
      {
        text: "she let them name her. i understand why.",
        top: '18%', left: '1%'
      },
      {
        text: "the coat that almost fits.\nshe'll wear it until she forgets it isn't hers.",
        top: '50%', left: '-2%'
      },
      {
        text: "i would have done the same.\ni think i did do the same. somewhere.",
        top: '76%', left: '0%'
      }
    ],
    text: [
      "You nod.",
      "The neighbor seems satisfied. She tells you a few things about the town — the market on Thursdays, the path down to the beach that doesn't wash out in winter, the man two streets over who plays music too loudly on weekends but means no harm by it.",
      "You listen. You say thank you. She leaves.",
      "The boy waves from the gate.",
      "You stand in the kitchen for a long time after they're gone. The shape of yourself that you agreed to — the one who keeps to herself, who took the Maren place, who belongs here by default — settles over you like a coat that almost fits.",
      "It is not uncomfortable. That is the unsettling part.",
      "You do not look through the window that faces the sea."
    ],
    next: 'n8a2'
  },

  // ----------------------------------------------------------------
  // ACT 2 — TWO SHORES: CITY BRANCH
  // Worldline: 1.2
  // ----------------------------------------------------------------

  n4b: {
    type: 'prose',
    bleeds: [
      {
        text: "she thinks the city is loud.\nbut it's quieter than the sea.",
        top: '62%', left: '0%'
      }
    ],
    text: [
      "The city does not notice your arrival.",
      "Your room is on the third floor of a building that smells of old wood and other people's cooking. The window faces a narrow street. Below, someone is always doing something. Carrying groceries, arguing loudly into a phone, walking a dog that stops at everything.",
      "You unpack slowly. The stuffed rabbit goes on the windowsill.",
      "There is a chair in the corner that was already there when you arrived. It belongs to no one now. You sit in it that first evening and listen to the building settle around you (the pipes, the footsteps above, the television through the wall) and you think: this is what it sounds like to be surrounded by people who don't know you exist.",
      "It doesn't feel great. But it's not as bad as you expected, either."
    ],
    next: 'n5b'
  },

  n5b: {
    type: 'prose',
    bleeds: [
      {
        text: "so this is where it thins for her. \nshe must be frightened. i know i was.",
        top: '33%', left: '1%'
      },
      {
        text: "how could i ever forget you. \neven now, i still think about you every day.",
        top: '66%', left: '-1%'
      }
    ],
    text: [
      "A couple days later, a letter arrives.",
      "It's slipped under your door in the early morning, before you are awake. You find it when you get up: a pale envelope, your name on it in handwriting that is almost, but not quite yours. It's close enough that you stand in the hallway for a moment, uncertain.",
      "Inside is a single page, dense with someone's careful script. The letter speaks of a garden that is overgrown now, of a dog that died last winter, of a feeling the writer cannot name except to say it arrives every evening around dusk and makes it difficult to be around other people.",
      "At the bottom: I can't stop thinking of you. Are you well? Do you ever think of me?",
      "No signature.",
      "You read it three times. Then you set it on the table by the chair that belongs to no one."
    ],
    next: 'n6b'
  },

  n6b: {
    type: 'fork',
    bleeds: [
      {
        text: "she's deciding again. she thinks it's about courage.\nit's about whether she believes she deserves to be found.",
        top: '20%', left: '0%'
      },
      {
        text: "i wrote back. it changed everything.\ni'm still not sure if it was the right choice",
        top: '66%', left: '-1%'
      }
    ],
    text: [
      "You sit with the letter for some more days.",
      "You think about the garden. You think about the dog you never knew. You think about dusk, and what it means to find people difficult, and whether you've ever told anyone that or only thought it in that language of feelings we all believe no one else experiences.",
      "The writer knows your name. Knows where you are. Knew before you did, perhaps, that you would end up in this room, in this city, on this chair.",
      "One evening, you take out a piece of paper.",
      "Your hands are shaking."
    ],
    prompt: "Do you write back?",
    choices: [
      { label: "Yes — you find the words, slowly",                          next: 'n7b1', worldlineSuffix: '.1' },
      { label: "No — you put the letter away and do not take it out again", next: 'n7b2', worldlineSuffix: '.2' }
    ]
  },

  // City + Wrote back
  n7b1: {
    type: 'prose',
    bleeds: [
      {
        text: "she let herself be found.\ni'm trying to remember what that felt like.",
        top: '16%', left: '0%'
      },
      {
        text: "the garden. she doesn't know yet that she's\nthe thing that grew despite neglect.",
        top: '50%', left: '-1%'
      },
      {
        text: "i'm glad she wrote back.\neven from here, i'm glad.",
        top: '78%', left: '1%'
      }
    ],
    text: [
      "You write: I remember you. I'm not sure what else to say. I think about dusk the same way.",
      "You address the envelope to a familiar name. You leave it with the woman at the front desk without explanation.",
      "Some days later, another letter comes.",
      "This one is longer. It describes the garden in more detail: what was planted there, what grew anyway despite neglect, what refuses to come back no matter what. It asks you two questions, carefully, as though they cost something to write.",
      "You read it standing up. You sit down halfway through.",
      "The room feels different after. Not larger, exactly. But less sealed."
    ],
    next: 'n8b1'
  },

  // City + Stayed silent
  n7b2: {
    type: 'prose',
    bleeds: [
      {
        text: "she folded it away. i thought she might.",
        top: '14%', left: '0%'
      },
      {
        text: "the book. she'll open it again someday.\nshe knows she will.",
        top: '48%', left: '-1%'
      },
      {
        text: "at dusk. even here, at dusk.\nwe all carry the same things to different places.",
        top: '78%', left: '1%'
      }
    ],
    text: [
      "You fold the letter once, carefully, and place it inside the cover of a book you brought with you. You choose the book deliberately — one you have read many times, one you know you will not open again soon.",
      "The days that follow are ordinary. You learn the rhythms of the street below. You find a place that makes good coffee. You begin to know, by sound, which neighbor leaves earliest in the morning.",
      "The letter is not forgotten. It is simply set aside, the way you set aside many things — with the private understanding that setting aside is not the same as deciding, and that some decisions make themselves in time.",
      "At dusk, you find rooms difficult.",
      "You do not tell anyone."
    ],
    next: 'n8b2'
  },

  // ----------------------------------------------------------------
  // ACT 2 CONSEQUENCES
  // One node per branch outcome, before the seam.
  // ----------------------------------------------------------------

  // Seaside + Truth consequence
  n8a1: {
    type: 'prose',
    bleeds: [
      {
        text: "she chose to be known. i wonder if it lightened her.\nor if it just made the weight more visible.",
        top: '30%', left: '0%'
      },
      {
        text: "i keep trying to imagine telling the truth like that.\ni think i would have lost something. she seems to have found it.",
        top: '68%', left: '-1%'
      }
    ],
    text: [
      "The neighbor comes back a third time. This time without the boy, without food. She sits at your table and asks you a question you weren't expecting.",
      "She wants to know what you're looking for.",
      "You think about it honestly, which takes longer than it should. You tell her you aren't sure. That you thought leaving would make things clearer, but so far the clarity hasn't arrived.",
      "She nods as though this is a reasonable answer. She tells you that Maren left for the same reason, forty years ago. That she came back. That she didn't regret either thing.",
      "After she leaves, you stand at the window. The sea is doing what it always does. You feel, for the first time, like a specific person in a specific place — not just a shape the wind is moving."
    ],
    next: 'seam'
  },

  // Seaside + Silence consequence
  n8a2: {
    type: 'prose',
    bleeds: [
      {
        text: "the borrowed name is settling in.\ni can see it from here. the way she's starting to answer to it.",
        top: '25%', left: '1%'
      },
      {
        text: "i wonder if she knows she's grieving something.\nor if she thinks this is just what peace feels like.",
        top: '65%', left: '-1%'
      }
    ],
    text: [
      "The weeks pass. You become, incrementally, the person who took the Maren place.",
      "The neighbor waves when she sees you at the market. The man two streets over nods. The boy, when he visits his grandmother, always checks that the rabbit is still on the shelf.",
      "It is not a bad life. It fits in most of the ways that matter.",
      "But sometimes, walking back from the cliff path in the evening, you catch yourself about to say something — and then don't. The unsaid thing has no specific shape. It is not a confession or a correction. It is simply the feeling that somewhere inside you, someone is still waiting to be introduced."
    ],
    next: 'seam'
  },

  // City + Wrote back consequence
  n8b1: {
    type: 'prose',
    bleeds: [
      {
        text: "the letters keep coming.\ni can feel her getting less afraid of them.",
        top: '22%', left: '0%'
      },
      {
        text: "she's learning to take up space in someone's thoughts.\nit's strange to watch. i forgot that was possible.",
        top: '60%', left: '-1%'
      }
    ],
    text: [
      "More letters come. You write back to all of them.",
      "The correspondence has its own rhythm now — questions answered, questions asked, the slow accumulation of a person in words. You learn about the garden in winter, about the sound the house makes in the wind, about a childhood memory involving a red coat that makes you laugh out loud alone in your room.",
      "You write that back too. That you laughed.",
      "One evening you realize you've been in the city for months and this room, this chair, this particular quality of light in the late afternoon — it has become yours without your noticing. You didn't choose it exactly. You just kept returning to it.",
      "The latest letter is on the table. You haven't opened it yet. You find you are looking forward to it in a way that doesn't frighten you."
    ],
    next: 'seam'
  },

  // City + Silence consequence
  n8b2: {
    type: 'prose',
    bleeds: [
      {
        text: "the letter is still in the book.\ni know because i put mine in a book too.",
        top: '18%', left: '0%'
      },
      {
        text: "she thinks she's protecting herself.\nshe is. that's the hardest part to watch.",
        top: '52%', left: '-1%'
      },
      {
        text: "i hope she opens the book.\ni hope she writes back before it's too late.\ni didn't.",
        top: '80%', left: '1%'
      }
    ],
    text: [
      "The book sits on the shelf. You do not open it.",
      "Life organizes itself around the not-opening. You find other things to read. You rearrange the shelf twice. Once, you pick the book up and hold it for a long moment, feeling the slight extra weight of the letter inside, and then put it back.",
      "You tell yourself you're not ready. This is probably true.",
      "But some evenings, at dusk, you sit in the chair that belongs to no one and you think about the garden. About what grows despite neglect. About the particular kind of courage it takes to ask someone if they still think of you, and to mean it, and to send it anyway.",
      "You don't know their name. You realize this only now. The letter had no signature, and you never looked for one."
    ],
    next: 'seam'
  },

  // ----------------------------------------------------------------
  // THE SEAM
  // All worldlines converge. One screen, no choices.
  // ----------------------------------------------------------------

  seam: {
    type: 'seam',
    text: [
      "There is a moment — you have had it before, in other forms — where you become aware, briefly, of all the lives you are not living.",
      "It arrives without warning. Usually in the evening. Usually when you are doing something ordinary — washing a dish, watching the street, lying still in a room that is becoming familiar.",
      "The feeling is not grief, exactly. It is more like the awareness of a frequency you cannot quite tune to. Something adjacent. Something that knows your name and uses it differently.",
      "You have made choices. The choices have made you. This is not a complaint — it is just the shape of things, the way a river is shaped by what it runs against.",
      "You breathe.",
      "You continue."
    ],
    next: 'n8'
  },

  // ----------------------------------------------------------------
  // ACT 3 — DEEPENING
  // Bleed-throughs multiply and begin to contradict each other.
  // ----------------------------------------------------------------

  n8: {
    type: 'prose',
    bleeds: [
      {
        text: "she's still asking. she'll always ask.\nthat's the one thing we all kept.",
        top: '18%', left: '0%'
      },
      {
        text: "i stopped asking.\ni'm not sure if that's peace or just distance.",
        top: '50%', left: '-1%'
      },
      {
        text: "the question is the wrong question.\nbut i don't know how to tell her that from here.",
        top: '76%', left: '1%'
      }
    ],
    text: [
      "Some weeks have passed.",
      "You have settled into something — not happiness, not unhappiness, but a particular texture of days that you recognize as yours. You have a routine. You have a face you make at certain hours. You have begun to think of the future in small increments, which feels like progress.",
      "And yet.",
      "At night, before sleep, there is a question you cannot stop asking. It does not have words exactly — it is more like a pressure, a directional thing, as though some part of you is always oriented toward somewhere else. Toward a version of this that went differently.",
      "You wonder, not for the first time, if everyone feels this. If this is just the cost of having chosen at all."
    ],
    next: 'n9'
  },

  // Prose-variant: seaside and city versions of the mirror moment
  n9: {
    type: 'prose-variant',
    bleeds: [
      { text: "there she is.",                                                    top: '8%',  left: '0%' },
      { text: "she sees us. she doesn't know\nthat's what she's doing, but she does.", top: '32%', left: '-1%' },
      { text: "the window. always the window.\nwe all found a window.",            top: '58%', left: '1%' },
      { text: "i looked like her once.\nor she looked like me.\ni can't remember which direction that goes.", top: '78%', left: '0%' }
    ],
    variants: {
      seaside: [
        "You catch your reflection in the window that faces the sea.",
        "You look like yourself. Of course you do. But there is a moment — just a moment — where the face looking back seems to belong to someone who made different choices, who arrived somewhere else, who is also, right now, looking into a reflection and thinking something similar.",
        "The moment passes.",
        "The sea is loud tonight."
      ],
      city: [
        "You catch your reflection in the dark window above the street.",
        "You look like yourself. Of course you do. But there is a moment — just a moment — where the face looking back seems to belong to someone standing at a cliff's edge, looking out at water, also catching her reflection in something, also thinking something similar.",
        "The moment passes.",
        "Below, the street continues its small negotiations."
      ]
    },
    next: 'n10_route'
  },

  // Routes to door-choice or door-closed based on fork2
  n10_route: {
    type: 'route',
    openNext:   'n10',
    closedNext: 'n10_closed'
  },

  // The door — Fork 3, identical across all branches
  n10: {
    type: 'fork',
    bleeds: [
      { text: "the door.",                                                         top: '6%',  left: '0%' },
      { text: "she's dreaming what we all dreamed.",                               top: '24%', left: '-1%' },
      { text: "i opened it. what i found was just another room.\nbut it was mine.", top: '44%', left: '1%' },
      { text: "don't. there's nothing there.\nthere's everything there. i can't.",  top: '62%', left: '0%' },
      { text: "she'll choose what she chooses. we all did.",                        top: '82%', left: '-1%' }
    ],
    text: [
      "You dream of a door.",
      "It is not a remarkable door — wooden, ordinary, slightly swollen in its frame the way doors get in damp weather. You have seen this door before. You cannot remember where.",
      "In the dream, you stand in front of it for a long time. You are aware, in the way of dreams, that on the other side is something you left behind. Not an object. Not a person exactly. Something closer to a version — of yourself, of a moment, of a road not taken.",
      "The dream does not tell you what to do.",
      "You wake up. The door is not there.",
      "But the feeling remains — the sense of standing just before something, hand not yet raised to knock."
    ],
    prompt: "There is a door. You have been here before.",
    choices: [
      { label: "You open it",              next: 'card', worldlineSuffix: '.1' },
      { label: "You stand at the threshold", next: 'card', worldlineSuffix: '.2' }
    ]
  },

  // The door — with choice (open paths: truth / wrote back)
  // n10 unchanged below

  // The door — silence paths: fork between denial and deferral
  n10_closed: {
    type: 'fork',
    bleeds: [
      { text: "she's standing at the door.",                                              top: '8%',  left: '0%' },
      { text: "i know this dream. i had it too.",                                         top: '28%', left: '-1%' },
      { text: "she won't open it. i can tell from here.\nthe question is why.",          top: '52%', left: '1%' },
      { text: "some of us say it meant nothing.\nsome of us say: not yet.\nboth are true. neither is.", top: '76%', left: '0%' }
    ],
    text: [
      "You dream of a door.",
      "It is not a remarkable door — wooden, ordinary, slightly swollen in its frame the way doors get in damp weather. You have seen this door before. You cannot remember where.",
      "In the dream, you stand in front of it for a long time. You are aware, in the way of dreams, that on the other side is something you left behind. Not an object. Not a person exactly. Something closer to a version — of yourself, of a moment, of what might have been said.",
      "Your hand rises toward the handle.",
      "And then doesn't.",
      "You wake up. The door is not there.",
      "You lie still for a moment, deciding what the dream meant."
    ],
    prompt: "What do you tell yourself?",
    choices: [
      { label: "It was just a dream. It meant nothing.", next: 'card', worldlineSuffix: '.1' },
      { label: "Not yet. But someday.",                  next: 'card', worldlineSuffix: '.2' }
    ]
  },

  // ----------------------------------------------------------------
  // ACT 4 — THE CARD & FINAL
  // Handled separately by engine.js (renderCard, renderFinal)
  // ----------------------------------------------------------------

  card:  { type: 'card' },
  final: { type: 'final' }
};

// ============================================================
// ENDING VARIANTS
// Keyed by full worldline string (e.g. "1.1.1.1")
// ============================================================

const ENDINGS = {
  // Seaside + truth
  '1.1.1.1': 'someone who told the truth when it cost something, and then opened the door anyway',
  '1.1.1.2': 'someone who told the truth and then stood very still at the threshold',
  // Seaside + silence
  '1.1.2.1': 'someone who wore a borrowed shape and decided the door was only a dream',
  '1.1.2.2': 'someone who wore a borrowed shape and kept the door in her pocket, for later',
  // City + wrote back
  '1.2.1.1': 'someone who let herself be found, and then opened every door she came to',
  '1.2.1.2': 'someone who reached out once, and then stood at the door, and decided that was enough for now',
  // City + silence
  '1.2.2.1': 'someone who folded things away carefully and told herself the door was nothing',
  '1.2.2.2': 'someone who folded things away carefully and left the door for another day'
};

// ============================================================
// BLEED-THROUGH QUOTES FOR CARD
// Selected based on player's path prefix
// ============================================================

const CARD_BLEEDS = {
  '1.1':   ["she chose the water.", "she lets them decide who she is.", "she's deciding again."],
  '1.2':   ["she thinks the city is loud.", "she's reading it again.", "she's deciding again."],
  '1.1.1': ["she told them. i didn't think she would.", "braver. or maybe just more tired of pretending."],
  '1.1.2': ["she let them name her. i understand why.", "the coat that almost fits.", "it was just a dream. she said it so quickly."],
  '1.2.1': ["she let herself be found.", "i'm glad she wrote back. even from here, i'm glad."],
  '1.2.2': ["she folded it away. i thought she might.", "at dusk. even here, at dusk.", "not yet. she's been saying that for a while now."]
};