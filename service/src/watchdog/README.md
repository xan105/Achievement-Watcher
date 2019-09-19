Know issues of steam emulators regarding their behavior and watchdog.

## Hoodlum

+ When the game triggers an Ach. unlock //SetAchievement()<br> 
it rewrites the achievement timestamp.<br>
An already unlocked achievement is considered a new unlocked one.

## RLD!

+ When the game triggers an Ach. unlock //SetAchievement()<br> 
it rewrites the achievement timestamp.<br>
An already unlocked achievement is considered a new unlocked one.

+ Save achievement(s) data on game's process exit.<br>
Breaking Watchdog logic even with `checkIfProcessIsRunning = false`


## All Steam Emu (except SSE I think)

+ Emulator doesn't generate/update its .ini file (if any) where ach. data are stored on ach. unlock.<br>
Some rare game needs [GetNumAchievements()](https://partner.steamgames.com/doc/api/ISteamUserStats#GetNumAchievements) and [GetAchievementName()](https://partner.steamgames.com/doc/api/ISteamUserStats#GetAchievementName) to return its own ach. data.<br>
In general games should not need these functions because they should have a list of existing achievements compiled into them ...<br>

Example:
 
  - Phoenix Wright: Ace Attorney Trilogy
