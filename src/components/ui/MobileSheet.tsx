import type { ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MobileSheetProps {
  readonly trigger: ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Componente Bottom Sheet móvil basado en `@radix-ui/react-dialog` (patrón Sheet de shadcn/ui).
 * Despliega información clínica y vista previa del mensaje de WhatsApp desde el borde inferior
 * en pantallas móviles (393x852px) sin recargar la vista principal.
 */
export function MobileSheet({
  trigger,
  title,
  description,
  children,
  className,
}: MobileSheetProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity" />
        <DialogPrimitive.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[430px] rounded-t-3xl border-t border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-2xl focus:outline-none pb-safe-bottom max-h-[85dvh] overflow-y-auto',
            className
          )}
        >
          {/* Barra superior tipo tirador (Drag Handle nativo iOS/Android) */}
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--brand-border)]" />

          <div className="flex items-start justify-between gap-3 border-b border-[var(--brand-border)] pb-3">
            <div className="space-y-0.5">
              <DialogPrimitive.Title className="text-base font-bold text-[var(--brand-text)]">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="text-xs text-[var(--brand-text-muted)]">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>

            <DialogPrimitive.Close
              aria-label="Cerrar panel"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-canvas)] text-[var(--brand-text-muted)] hover:text-[var(--brand-text)] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="pt-4">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
