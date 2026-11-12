"use client";

import { Component } from "react";
import Image from "next/image";

/** Keep the homepage alive if WebGL / R3F throws on a device. */
export class Hero3DBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // Swallow — poster fallback is enough for shoppers.
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="hero-stage relative h-[34vh] min-h-52 w-full overflow-hidden lg:h-[min(520px,52vh)] lg:min-h-[420px]">
          <Image
            src="/posters/hero.svg"
            alt="Toys and home décor"
            fill
            priority
            sizes="(min-width: 1024px) 560px, 90vw"
            className="object-contain drop-shadow-lg"
          />
        </div>
      );
    }
    return this.props.children;
  }
}
