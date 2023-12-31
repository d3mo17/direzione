
# Direzione

A browser based application to manage a martial arts tournament.
In its early state, it can handle a playlist of opponents and displays the scoring by a scoreboard.

### Features / Structure / Interface

* AMD-, CommonJS and global-support

### Installation

```shell
    $ npm install direzione
    $ npx direzione-fit
```

### API documentation
[API of Direzione](api.md)


## Scoreboard Example

This example shows how a scoreboard can be controlled by persons sitting at the referee table.

## How to use

It is important to execute all installation steps mentioned above, before direzione is ready to use.
Open file `scoreboard_gui.html` in a browser window and file `remote_scorboard.html` in another browser window.
You can also open `all_in_one_demo.html` instead. This file uses frames to load the other two documents in one browser window, so you can see what happens at a glance.

## Control keys in scoreboard gui

| Key | Funtion |
| --- | --- |
| Return/Spacebar | start/pause/resume countdown |
| "Q" | Add eight points to score of white opponent (Ippon to white side) |
| "W" | Add four points to score of white opponent (Wazari to white side) |
| "E" | Add a penalty point to white opponent (Shido to white side) |
| "A" | Subtract eight points to score of white opponent (Remove Ippon from white side) |
| "S" | Subtract four points to score of white opponent (Remove Wazari from white side) |
| "D" | Subtract a penalty point to white opponent (Remove Shido from white side) |
| "I" | Add eight points to score of red opponent (Ippon to red side) |
| "O" | Add four points to score of red opponent (Wazari to red side) |
| "P" | Add a penalty point to red opponent (Shido to red side) |
| "K" | Subtract eight points to score of red opponent (Remove Ippon from red side) |
| "L" | Subtract four points to score of red opponent (Remove Wazari from red side) |
| ";" or "Ö" | Subtract a penalty point to red opponent (Remove Shido from red side) |
| Arrow keys (left/right) | During countdown runs, starts counting up to measure the time how long one opponent holds the other in a grip |
| Arrow up | Stops counting up for time measure fin a grip |

## Connection Technique

The connection beetween `scoreboard_gui.html` and `remote_scorboard.html` will be handled trough WebRTC. The connection will be triggered by clicking the red button in the right upper corner of the scoreboard GUI. If the connection become established, the background color of the button changes to green.

### Troubleshooting

The ability to connect between scoreboards depends on a configured network. If you are not connected to a network, to get it work, you have to setup an ip address to your computer manually.

If you use a chromium based browser and the connection between the scoreboards will not get established (even if your computers network is configured), then move to "chrome://flags" and disable Option "Anonymize local IPs exposed by WebRTC" - try again afterwards!
After the connection between scoreboards was established once, you can switch the Option back.

## License

GPL-3.0

Copyright (C) 2023 Daniel Moritz

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, according to version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
