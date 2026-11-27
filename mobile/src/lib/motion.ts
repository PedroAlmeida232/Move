import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

/** Segue o "Reduzir movimento" do iPhone (Ajustes > Acessibilidade > Movimento). */
export function useReducedMotion(): boolean | null {
  // null enquanto o sistema não respondeu: quem anima espera para não piscar.
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    // Em alguns ambientes (testes, web antigo) a resposta pode faltar: aí anima normal.
    Promise.resolve(AccessibilityInfo.isReduceMotionEnabled?.()).then(
      (on) => active && setReduced(on === true),
      () => active && setReduced(false),
    );
    const sub = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      setReduced,
    );
    return () => {
      active = false;
      sub?.remove();
    };
  }, []);
  return reduced;
}

export const duration = { fast: 180, base: 320, slow: 700 } as const;

/** Valor de 0 a 1 que anima uma vez ao montar; com movimento reduzido, já nasce em 1. */
export function useAppear(ms: number = duration.base) {
  const reduced = useReducedMotion();
  const [value] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced === null) return;
    if (reduced) {
      value.setValue(1);
      return;
    }
    Animated.timing(value, {
      toValue: 1,
      duration: ms,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [reduced, ms, value]);
  return value;
}
