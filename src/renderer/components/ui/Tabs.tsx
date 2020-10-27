import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

type ActiveIndicatorProps = {
  className?: string;
  styles: any;
};

function ActiveIndicator({ className, styles }: ActiveIndicatorProps) {
  return (
    <div
      style={styles}
      className={clsx('w-full bg-indigo-600 h-0.5', className)}
    />
  );
}

function Tab({ text, onClick }: { text: string; onClick(): void }) {
  return (
    <button
      className="space-y-1 font-semibold focus:outline-none"
      onClick={onClick}
    >
      <p className="p-2 pb-0">{text}</p>
    </button>
  );
}

type Props = {
  tabs: string[];
  selectedIndex: number;
  onChange(index: number): void;
};

export default function Tabs({ tabs, selectedIndex, onChange }: Props) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeStyles, setActiveStyles] = useState({ width: 0, left: 0 });

  useEffect(() => {
    if (!tabsRef.current) {
      return;
    }

    const tab = tabsRef.current.children[selectedIndex] as HTMLElement;

    setActiveStyles({
      left: tab.offsetLeft,
      width: tab.offsetWidth,
    });
  }, [selectedIndex, tabsRef.current]);

  return (
    <div className="relative">
      <div className="flex space-x-4" ref={tabsRef}>
        {tabs.map((tab, index) => (
          <Tab key={index} onClick={() => onChange(index)} text={tab} />
        ))}
      </div>

      <ActiveIndicator
        className="absolute transition-all duration-150"
        styles={activeStyles}
      />
    </div>
  );
}
