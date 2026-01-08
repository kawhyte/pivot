'use client';

import { useState, useTransition } from 'react';
import { resetUserProgress } from '@/app/actions/quest';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ResetProgressButtonProps {
  userId: number;
}

const ResetProgressButton = ({ userId }: ResetProgressButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetUserProgress(userId);

      if (result.success) {
        toast.success('Progress Reset', {
          description: `All progress for User #${userId} has been reset.`,
        });
        setIsOpen(false);
      } else {
        toast.error('Reset Failed', {
          description: result.error || 'Failed to reset progress. Please try again.',
        });
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isPending}
          className="gap-1.5"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset'
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-left">
              Reset Progress for User #{userId}?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            This will permanently delete all quest progress for this user. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleReset();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Progress'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetProgressButton;
