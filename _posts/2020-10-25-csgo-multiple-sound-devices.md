---
layout: post
title: "Setup Multiple Sound Devices in CS:GO"
subtitle: "How to setup your CS:GO audio settings if your headphones and mic are connected to different audio devices"
date: 2020-10-25
permalink: "/blog/csgo-multiple-sound-devices/"
thumbnail: "/assets/img/blog/thumbnails/csgo-multiple-sound-devices.png"
hidden: false
---

If you are reading this, you likely bought yourself a fancy new standalone microphone.
However, after plugging it in with the USB cable or even a fancy new sound interface and starting CS:GO,
you find yourself frustrated.
No one can hear what you are saying.
Opening the game sound settings reveals that the audio device of your mic is not selected.
But if you switch the audio device to your mic, you cannot hear anything anymore.
Surely that can't be the solution...

I found an easy way to both hear and speak in CS:GO using different audio devices.

### The Problem

CS:GO only allows you to select one audio device.
People have been struggling with this ever since the game launched and 8 years later we still don't have an official solution.

![Standard audio settings](/assets/img/blog/csgo-multiple-sound-devices/csgo-audio-settings.png)

### The Solution

Create a virtual audio device that you can use in CS:GO.
I used [Voicemeeter](https://vb-audio.com/Voicemeeter/index.htm) for this.
It's free but consider donating if this solves your problem.

#### Voicemeeter Settings

There are just four steps necessary to make this work:

1. Choose your mic audio device as the hardware input.
2. Make sure that it is only sent to the `B` channel, or you will hear yourself.
3. Make sure that the virtual input only sends to the `A` channel, or your teammates will hear your audio.
4. Click on `A1` and choose your output device. It should appear right next to it as hardware output.

![Voicemeeter settings](/assets/img/blog/csgo-multiple-sound-devices/voicemeeter-settings.png)

#### Additional Settings

If you want to run these settings by default on startup, you can click on `Menu` in the top right corner,
save your settings and then select the same check boxes that I did.
It will prompt you to select the settings that you just saved.

![Additional settings](/assets/img/blog/csgo-multiple-sound-devices/additional-settings.png)

To not show Voicemeeter in your task bar all the time, right-click on
the logo in the system tray and choose `Hide Voicemeeter`.

![Hide Voicemeeter](/assets/img/blog/csgo-multiple-sound-devices/hide-voicemeeter.png)

#### CS:GO Settings

Voicemeeter will pop up in your audio devices.
There should be only one with "VOICEMEETER" in its name.

![Standard audio settings](/assets/img/blog/csgo-multiple-sound-devices/csgo-audio-settings-fixed.png)

#### Windows Settings

I only use this workaround for CS:GO.
Most other programs with dedicated audio settings and windows itself are able to select different audio
devices for input and output out of the box (as one might expect).
Even though Voicemeeter pops up in there as well, I don't use it.
For me it's not the mic but the headphones that I run through a different interface than my on-board sound card.

![Windows output settings](/assets/img/blog/csgo-multiple-sound-devices/windows-output-settings.png)

![Windows input settings](/assets/img/blog/csgo-multiple-sound-devices/windows-input-settings.png)

Hope this helps you as well.
Sorry for some of the screenshots containing German and Swedish...
