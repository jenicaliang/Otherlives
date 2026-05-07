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
      "Now is no time for daydreams. The carpet beneath your feet is soft, worn thin in the places you always stand. The suitcase in front of you sits politely, open and waiting. In it are your few possessions — all together, they barely reach the top. A toothbrush. A couple of your favorite clothes. A stuffed rabbit.",
      "There is a loss here, though you cannot locate it.",
      "Even without the opportunity, the request — there is a pull. Away from this place, away from the shape your life has taken in these rooms. And in this moment the pull is stronger than the absence not yet fully felt.",
      "The rain continues. You do not move."
    ],
    next: 'n2'
  },

  n2: {
    type: 'prose',
    bleeds: [],
    text: [
      "You have been in this room long enough to know its sounds. The particular creak of the radiator at night. The way sound carries from the street differently in winter. The neighbor whose schedule you have memorized without meaning to.",
      "You will not miss these things. Or you will miss them terribly. You have not yet decided which is true, or if the deciding matters at all.",
      "The suitcase is already packed. That is its own kind of answer.",
      "What you are doing is not brave. You know that. It is simply the thing your body has agreed to do while your mind was looking elsewhere. And now here you are, coat on, keys in hand, the door just there.",
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
      "Something shifts.",
      "You cannot name it. A sensation like a word on the tip of the tongue, or the moment just after a door closes. You are the same as you were a moment ago. You are also not."
    ],
    bleed: {
      text: "she's already gone the other way.\ni felt it when she chose.",
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
        text: "she chose the water.\ni wonder if she knows what she came here to find.",
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
    next: 'seam'
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
    next: 'seam'
  },

  // ----------------------------------------------------------------
  // ACT 2 — TWO SHORES: CITY BRANCH
  // Worldline: 1.2
  // ----------------------------------------------------------------

  n4b: {
    type: 'prose',
    bleeds: [
      {
        text: "she wanted to disappear.\nshe should have known disappearing isn't the same as rest.",
        top: '62%', left: '0%'
      }
    ],
    text: [
      "The city does not notice you arrive.",
      "Your room is on the third floor of a building that smells of old wood and other people's cooking. The window faces a narrow street. Below, someone is always doing something — carrying groceries, arguing quietly into a phone, walking a dog that stops at everything.",
      "You unpack slowly. The stuffed rabbit goes on the windowsill.",
      "There is a chair in the corner that was already there when you arrived. It belongs to no one now. You sit in it that first evening and listen to the building settle around you — the pipes, the footsteps above, the television through the wall — and you think: this is what it sounds like to be surrounded by people who don't know you exist.",
      "It is not as bad as you expected. It is not good, either."
    ],
    next: 'n5b'
  },

  n5b: {
    type: 'prose',
    bleeds: [
      {
        text: "she's reading it again.\nshe already knows what she'll do.",
        top: '33%', left: '1%'
      },
      {
        text: "someone found her anyway.\nthat's the thing about disappearing —\nyou leave a shape behind.",
        top: '66%', left: '-1%'
      }
    ],
    text: [
      "On the sixth day, a letter arrives.",
      "It is slipped under your door in the early morning, before you are awake. You find it when you get up — a pale envelope, your name on it in handwriting that is almost familiar. Not quite yours. Close enough that you stand in the hallway for a moment, uncertain.",
      "Inside: a single page, dense with someone's careful script. The letter speaks of a garden that is overgrown now, of a dog that died last winter, of a feeling the writer cannot name except to say it arrives every evening around dusk and makes it difficult to be in rooms with other people.",
      "At the bottom: I don't know if you remember me. I think about whether you do.",
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
        text: "i wrote back. it changed everything.\ni'm still not sure that was the right word for what happened.",
        top: '66%', left: '-1%'
      }
    ],
    text: [
      "You sit with the letter for three days.",
      "You think about the garden. You think about the dog you never knew. You think about dusk, and what it means to find rooms difficult, and whether you have ever said that to anyone or only thought it in the particular wordless way of things you believe no one else experiences.",
      "The writer knows your name. Knows where you are. Knew before you did, perhaps, that you would end up in this room, in this city, in this chair.",
      "On the third evening, you take out a piece of paper.",
      "Your hands are very still."
    ],
    prompt: "Do you write back?",
    choices: [
      { label: "Yes — you find the words, slowly",                          next: 'n7b1', worldlineSuffix: '.1' },
      { label: "No — you fold the letter away and do not take it out again", next: 'n7b2', worldlineSuffix: '.2' }
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
      "You write: I remember you. I'm not sure how to say what I want to say, so I'll say the simplest thing: I think about dusk the same way.",
      "You address the envelope to a name you didn't know you still knew. You leave it with the woman at the front desk without explanation.",
      "Three days later, another letter comes.",
      "This one is longer. It describes the garden in more detail — what was planted there, what grew anyway despite neglect, what refuses to come back no matter what. It asks you two questions, carefully, as though they cost something to write.",
      "You read it standing up. You sit down halfway through.",
      "The room feels different after. Not larger, exactly. But less sealed."
    ],
    next: 'seam'
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
    next: 'n10'
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
  '1.1.1.1': 'someone who told the truth when it cost something, and then opened the door anyway',
  '1.1.1.2': 'someone who told the truth and then stood very still at the threshold',
  '1.1.2.1': 'someone who let others name her, and then opened the door to see if she had a name of her own',
  '1.1.2.2': 'someone who wore a borrowed shape and decided, quietly, that the door could wait',
  '1.2.1.1': 'someone who let herself be found, and then opened every door she came to',
  '1.2.1.2': 'someone who reached out once, and then stood at the door, and decided that was enough for now',
  '1.2.2.1': 'someone who folded things away carefully, and then opened the door anyway',
  '1.2.2.2': 'someone who kept her own counsel, and kept the door, and called it hers'
};

// ============================================================
// BLEED-THROUGH QUOTES FOR CARD
// Selected based on player's path prefix
// ============================================================

const CARD_BLEEDS = {
  '1.1':   ["she chose the water.", "she lets them decide who she is.", "she's deciding again."],
  '1.2':   ["she wanted to disappear.", "she's reading it again.", "she's deciding again."],
  '1.1.1': ["she told them. i didn't think she would.", "braver. or maybe just more tired of pretending."],
  '1.1.2': ["she let them name her. i understand why.", "the coat that almost fits."],
  '1.2.1': ["she let herself be found.", "i'm glad she wrote back. even from here, i'm glad."],
  '1.2.2': ["she folded it away. i thought she might.", "at dusk. even here, at dusk."]
};