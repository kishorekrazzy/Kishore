import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
  as = 'h2'
}) => {
  // Local alias so the element type can be an h2 for a heading or a
  // plain wrapper for body copy — rendering paragraphs inside an <h2>
  // would be wrong markup.
  const Tag = as;
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    /* This site scrolls inside #main-scroll, not the window — body is
       overflow:hidden. A trigger left watching the window would simply
       never fire, so the container is resolved here rather than requiring
       every call site to thread a ref down. */
    const scroller =
      (scrollContainerRef && scrollContainerRef.current) ||
      document.getElementById('main-scroll') ||
      window;

    const tweens = [];

    tweens.push(gsap.fromTo(
      el,
      { transformOrigin: '0% 50%', rotate: baseRotation },
      {
        ease: 'none',
        rotate: 0,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top bottom',
          end: rotationEnd,
          scrub: true
        }
      }
    ));

    const wordElements = el.querySelectorAll('.word');

    tweens.push(gsap.fromTo(
      wordElements,
      { opacity: baseOpacity, willChange: 'opacity' },
      {
        ease: 'none',
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top bottom-=20%',
          end: wordAnimationEnd,
          scrub: true
        }
      }
    ));

    if (enableBlur) {
      tweens.push(gsap.fromTo(
        wordElements,
        { filter: `blur(${blurStrength}px)` },
        {
          ease: 'none',
          filter: 'blur(0px)',
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom-=20%',
            end: wordAnimationEnd,
            scrub: true
          }
        }
      ));
    }

    return () => {
      /* Upstream cleanup was ScrollTrigger.getAll().forEach(t => t.kill()),
         which kills EVERY trigger on the page — other ScrollReveals, and
         SplitText's too. One instance unmounting would silently break every
         other scroll animation on the site. Only kill what this made. */
      tweens.forEach(t => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, [as, scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return (
    <Tag ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </Tag>
  );
};

export default ScrollReveal;
