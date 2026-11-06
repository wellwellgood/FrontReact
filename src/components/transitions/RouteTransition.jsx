import { useLocation } from "react-router-dom";
import styles from "./RouteTransition.module.css";

export default function RouteTransition() {
  const location = useLocation();
  const transitionKey = `${location.pathname}${location.search}`;

  return <div key={transitionKey} className={styles.wipe} aria-hidden="true" />;
}
