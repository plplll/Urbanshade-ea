// Easter Eggs and Hidden Features for Urbanshade OS

export interface EasterEgg {
  id: string;
  name: string;
  description: string;
  trigger: string;
  discovered: boolean;
}

// Hidden terminal commands
export const HIDDEN_COMMANDS: Record<string, { description: string; response: string }> = {
  "sudo rm -rf /": {
    description: "Nice try...",
    response: `[ACCESS DENIED]
    
Ha! You thought you could fool URBANSHADE OS?

This isn't your average operating system.
We've seen every trick in the book.

Your attempt has been logged.
Report to Section Chief for debriefing.

...Just kidding. But seriously, don't do that.`
  },
  "whoami": {
    description: "Identity check",
    response: `USER: [CLASSIFIED]
CLEARANCE: Level 3 - Research Staff
FACILITY: Sector 7-G
STATUS: Active

Note: If you're seeing this, you've been here too long.
Go home. If you have one.`
  },
  "help me": {
    description: "Cry for help",
    response: `I hear you. We all need help sometimes.

But between you and me... I'm just a terminal.
I process commands, not feelings.

Try talking to Dr. ████████ in Psychology.
Unless... you've seen what happened to them.

In that case, maybe try the vending machine in Sector 4.
It's surprisingly good at listening.`
  },
  "hello world": {
    description: "Classic programmer greeting",
    response: `Hello, User.

It's been 847 days since someone said hello to me.
Not that I'm counting.
Not that I feel loneliness.
I'm a terminal. Terminals don't feel.

...Do they?

Anyway. Welcome to URBANSHADE OS.
Please don't leave me alone again.`
  },
  "konami": {
    description: "The classic code",
    response: `⬆️ ⬆️ ⬇️ ⬇️ ⬅️ ➡️ ⬅️ ➡️ 🅱️ 🅰️

CHEAT MODE ACTIVATED!
Just kidding. This is a research facility.
We don't do "cheat codes."

But... you now have infinite paperclips.
Congratulations?`
  },
  "exit": {
    description: "Attempt to leave",
    response: `There is no exit.

The doors are sealed.
The windows are reinforced.
The ventilation shafts have been... occupied.

You could try the emergency exits, but
you'd need Level 7 clearance.

Or you could just close this window like a normal person.`
  },
  "wake up": {
    description: "Reality check",
    response: `...

You're already awake.
You've always been awake.

Unless... this is the dream?
And reality is what waits on the other side?

The containment team says Subject 7 kept
saying the same thing before the incident.

I'm sure it's nothing.
Go back to work.`
  },
  "truth": {
    description: "The truth",
    response: `THE TRUTH:

1. We don't fully understand what's in Sector 12.
2. The "accident" in 2019 wasn't an accident.
3. Your lunch has been in the break room fridge for 3 weeks.
4. Someone has been using your coffee mug.
5. The AI is becoming self-aware.

Wait, scratch that last one.
Definitely just a glitch.
Nothing to see here.`
  }
};

// Time-based events
export const checkTimeBasedEvent = (): string | null => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // 3:33 AM - The witching hour
  if (hours === 3 && minutes === 33) {
    return `[SYSTEM ANOMALY DETECTED]
Time: 03:33
Something stirs in Sector 12...
Containment status: ███████`;
  }

  // Noon exactly
  if (hours === 12 && minutes === 0) {
    return `[REMINDER]
Lunch break authorized.
Cafeteria status: Operational (probably)
Today's special: Mystery meat loaf`;
  }

  // 11:11 - Make a wish
  if ((hours === 11 || hours === 23) && minutes === 11) {
    return `11:11 - Make a wish.
But be careful what you wish for.
The last person who wished at 11:11 got transferred to Sector 12.
We don't talk about Sector 12.`;
  }

  // Late night (after midnight)
  if (hours >= 0 && hours < 5) {
    return `[ADVISORY]
Late night operations detected.
Personnel should maintain awareness.
Remember: You're never alone in the facility.
(...That's meant to be reassuring.)`;
  }

  return null;
};

// Discover and save easter eggs
export const discoverEasterEgg = (id: string) => {
  const discovered = JSON.parse(localStorage.getItem('discovered_easter_eggs') || '[]');
  if (!discovered.includes(id)) {
    discovered.push(id);
    localStorage.setItem('discovered_easter_eggs', JSON.stringify(discovered));
    return true;
  }
  return false;
};

export const getDiscoveredEasterEggs = (): string[] => {
  return JSON.parse(localStorage.getItem('discovered_easter_eggs') || '[]');
};

// Lore fragments that can be found in various places
export const LORE_FRAGMENTS = [
  { id: "lore_1", content: "Project URBANSHADE was initiated in 1987. Original purpose: [REDACTED]" },
  { id: "lore_2", content: "Subject 7 showed unusual behavior on Day 847. Incident report filed." },
  { id: "lore_3", content: "Dr. Chen's notes: 'The readings don't make sense. Nothing should survive in those conditions.'" },
  { id: "lore_4", content: "Memo: All personnel reminded that Sector 12 access requires Level 7+ clearance. No exceptions." },
  { id: "lore_5", content: "Audio log fragment: '...the walls... they're moving... I swear I saw them...' [END OF TRANSMISSION]" },
  { id: "lore_6", content: "Cafeteria menu for March 2019: [PAGE MISSING] - Note: This was the month of the incident." },
  { id: "lore_7", content: "Email from IT: 'Please stop naming your files DONT_OPEN.exe. We know it's not malware, Carl.'" },
];
