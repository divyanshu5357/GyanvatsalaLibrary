import React from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import '../index.css'

export default function ToastStack({ items = [] }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-72">
      <TransitionGroup>
        {items.map(item => (
          <CSSTransition key={item.id} timeout={200} classNames="toast">
            <div className={`glass rounded-lg p-3 shadow-lg border ${item.type === 'overdue' ? 'border-red-500/60' : 'border-amber-400/60'}`}>
              <div className="flex items-start gap-2">
                <span className="text-lg">{item.type === 'overdue' ? '⚠️' : '🔔'}</span>
                <div className="text-sm text-slate-100 leading-snug">{item.message}</div>
              </div>
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  )
}
