export function animateResource(routeCoordinates, duration = 5000) {
  const steps = routeCoordinates.length;
  const interval = duration / steps;
  let index = 0;
  return new Promise((resolve) => {
    const coords = { current: routeCoordinates[0] };
    const timer = setInterval(() => {
      index++;
      if(index >= steps) {
        clearInterval(timer);
        resolve(coords.current);
      } else {
        coords.current = routeCoordinates[index];
      }
    }, interval);
  });
}
