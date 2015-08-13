function eventHandler(state, event) {
  if(!state.hasOwnProperty('arr')){
    state.arr = [];
  }

  state.arr.push(event);

  return state;
}


