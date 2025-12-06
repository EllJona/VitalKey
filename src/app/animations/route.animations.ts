import { trigger, transition, style, query, animateChild, group, animate } from '@angular/animations';

/**
 * Animações suaves de transição entre rotas
 * Inspirado no estilo minimalista e elegante
 */
export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    // Estilo inicial
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0
      })
    ], { optional: true }),
    
    // Animações paralelas
    query(':enter', [
      style({ 
        opacity: 0,
        transform: 'translateY(20px)'
      })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          opacity: 0,
          transform: 'translateY(-10px)'
        }))
      ], { optional: true }),
      query(':enter', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ], { optional: true })
    ]),
    
    query(':enter', animateChild(), { optional: true })
  ])
]);

/**
 * Animação de fade suave
 */
export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0 }))
  ])
]);

/**
 * Animação de slide up
 */
export const slideUpAnimation = trigger('slideUpAnimation', [
  transition(':enter', [
    style({ 
      opacity: 0,
      transform: 'translateY(30px)'
    }),
    animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
      opacity: 1,
      transform: 'translateY(0)'
    }))
  ])
]);

/**
 * Animação de scale in
 */
export const scaleInAnimation = trigger('scaleInAnimation', [
  transition(':enter', [
    style({ 
      opacity: 0,
      transform: 'scale(0.95)'
    }),
    animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ 
      opacity: 1,
      transform: 'scale(1)'
    }))
  ])
]);

