---
layout: post
title: "Typing Browser Extension Background Script Communication"
subtitle: "Using TypeScript to prevent bugs in the communication between content and background scripts"
date: 2023-08-18
permalink: "/blog/background-script-message-typing/"
thumbnail: "/assets/img/blog/thumbnails/background-script-message-typing.png"
hidden: false
---

While refactoring the [flashkill browser extension](https://github.com/flashkillapp/flashkill),
I found myself, once more, debugging the communication between [content](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts)
and [background](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts) scripts
and decided to do something about it.

In this blog post I present the template, which enables full typing of messages, with type errors as soon as you try to send/receive a message
with a name that does not exist or a payload or return type, that does not match the receiving/sending part.

### The problem

The flashkill extension parses the page's content, runs http requests accordingly,
processes the returned html and injects selected details into the original page.
For that, several different [messages](https://developer.chrome.com/docs/extensions/mv3/messaging/)
need to be communicated between content and background scripts.

The go-to way to differentiate between messages, is to introduce some sort of parameter like a message `name`.
Like this you can choose which routine you want to trigger in the background script, by simply switching the `name`.

```js
// background.js
chrome.runtime.onMessage.addListener(
    (request: { name, payload }, _, callback): => {
      if (request.name === 'Load page X') {
        fetch(`www.pageX.com/${payload}`)
            .then(callback)
      }

      if (request.name === 'Load page Y') {
        fetch(`www.pageY.com/${payload}`)
            .then(callback)
      }

      return true;
    },
  );


// content.js
chrome.runtime.sendMessage(
    { name: 'Load pag X', payload: { path: 'www.did-you-spot-both-issues.com' } },
    (html) => { /* process result */ },
);
```

This can lead to several issues - misspelled `name` values or wrong `payload` or `callback` types.
If you stumbled upon this blog post, you will already know that the debugging of any of these issues leads to a lot of headaches.

### The solution

The template is split into two parts, but all contained in a single file.
The first part of the template is the definition of the message types.
A message is defined with a `name` a `payload` type and a `response` type.
To profit from the strict typing all the way through the message handling, the methods
`sendMessage` and `receiveMessage` are introduced, which wrap the `chrome.runtime` calls.
So this solution only has its full effect, when all message handling is done using these wrapper methods.

To add a new message, simply add a new member to the `MessageName` enum.
Immediately TypeScript should complain, that the `Messages` interface is incomplete.
This means you can only use the `sendMessage` and `receiveMessage` functions with strictly typed messages.
When you later decide to update the `name` of the message or the `payload` or `response` types, it will be much easier to refactor
and TypeScript should let you know if you forgot to adjust one of the elements in the chain.

Unfortunately this solution does not prevent you from forgetting to send/receive a message, that you are trying to receive/send...
but I think those errors are significantly easier to spot.

```ts
// messages.ts
export enum MessageName {
  GetPersonInformations = 'getPersonInformations',
}

interface Message {
  payload: unknown;
  response: unknown;
}

interface Messages extends Partial<Record<MessageName, Message>> {
  [MessageName.GetPersonInformations]: {
    payload: {
      ids: string[];
    };
    response: PersonInformation[];
  };
}

type MessageTypes = keyof Messages;
type MessagePayload<T extends MessageTypes> = Messages[T]['payload']
type MessageResponse<T extends MessageTypes> = Messages[T]['response']
type MessageCallback<T extends MessageTypes> = (response: MessageResponse<T>) => void;

export const sendMessage = <T extends MessageTypes>(
  name: T,
  payload: MessagePayload<T>,
  callback: MessageCallback<T>,
): void => {
  chrome.runtime.sendMessage(
    { name, payload },
    callback,
  );
};

export const receiveMessage = <T extends MessageTypes>(
  name: T,
  responder: (payload: MessagePayload<T>) => Promise<MessageResponse<T>>,
): void => {
  chrome.runtime.onMessage.addListener(
    (request: { name: T, payload: MessagePayload<T> }, _, callback: MessageCallback<T>): boolean => {
      if (request.name !== name) return false;

      responder(request.payload)
        .then(callback)
        .catch(console.log);

      return true;
    },
  );
};
```

To see this concept in action, check out the [flashkill browser extension](https://github.com/flashkillapp/flashkill/blob/f6b93eda26da3d271b2046eb88e267105136c859/src/util/messages.ts).