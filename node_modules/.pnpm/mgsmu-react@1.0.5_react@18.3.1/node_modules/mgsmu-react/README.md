# mgsmu-react - Minimal Global State Management Utility

- mgsmu-react is a lightweight global state management utility for React.  
- It provides a simple **publish-subscribe (pub-sub)** mechanism to manage global state without external libraries like Redux or Zustand.  
- Components can subscribe to specific keys and automatically re-render when those keys change.

## install
```
npm install --save mgsmu-react
```

## Import in any component

```jsx
import { useStateStore } from 'mgsmu-react';
```
- useStateStore() – React hook to access the global state and subscribe to changes.

## Invoke state
```jsx
const key = "data";
const [data, setData, removeData] = useStateStore(key);
```
- Parameter names are flexible (data, setData and removeData are just examples).
- keys can be used as you like. You can create as many keys as you like for different scenarios

## Set data and key

```jsx
const data = { specifics: "data", state: true, what: "next" };
setData(data)

// Functional Update 1.0.5
setData(prev => ({ ...prev, added: "new" }));
```
- Key: any string can be used ("data", "users", "messages", etc.)
- Data: any object or array can be stored under that key.
- Allows management of multiple independent keys in your global state

## Listen and catch changes

```jsx
useEffect(() => {
    if (!data) return;
    console.log(data); //use Data
  },[data])
```

```jsx
logs: {
    "specifics": "data",
    "state": true,
    "what": "next",
    "updatedAt": 1757423800721
}
```
- useEffect triggers whenever the specified key (data in this example) changes.
- Supports multiple keys — you can set up multiple useEffect hooks to listen to different keys individually.
- Ensures components only re-render when the relevant slice of state updates.

## Remove keys

```jsx
removeData("data");
```
- Deletes a key from the global state.
- Make sure component is clean if rendered again
- Note: Triggers re-render for components subscribed to that key.

----
**Notes**

- Every state update includes an updatedAt timestamp.
- The store works with any object structure, making it flexible for various use cases.
- Lightweight and minimal — no context providers or extra boilerplate required.
- Ideal for managing small to medium app state where a full state library would be overkill.

----
# Changelog

All notable changes to this project will be documented in this file.

---


## [1.0.5] - 2027-11-11
### Fixed
- Setter now supports functional update (like React’s setState)

## [1.0.4] - 2027-10-22
### Added
- Added UseClickSetter
  - Only Clicking purpose

## [1.0.3] - 2025-10-22
### Fixed
- Optimized listener notifications:
  - Only listeners subscribed to a changed or removed key are notified.
  - Previously, all listeners were notified on every state change.