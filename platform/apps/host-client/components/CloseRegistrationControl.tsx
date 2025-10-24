// apps/host-client/app/components/CloseRegistrationControl.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Helper function to trigger a file download in the browser
const downloadCsv = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export default function CloseRegistrationControl({ hackathonId, isRegistrationOpen, onRegistrationClosed }: { hackathonId: string, isRegistrationOpen: boolean, onRegistrationClosed: () => void }) {
    const { token } = useAuth();
    const [isClosing, setIsClosing] = useState(false);
    
    const handleCloseRegistration = async () => {
        setIsClosing(true);
        try {
            const response = await axios.post(`/api/protected/hackathons/${hackathonId}/close-registration`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const { teamsCsv, individualsCsv } = response.data;
            
            // Trigger downloads
            downloadCsv(teamsCsv, `approved-teams-${hackathonId}.csv`);
            downloadCsv(individualsCsv, `approved-individuals-${hackathonId}.csv`);

            // Notify the parent page that the state has changed
            onRegistrationClosed();
        } catch (error: any) {
            console.error("Failed to close registration", error);
            // We could show an error toast here, e.g., if registration is already closed.
            alert(`Error: ${error.response?.data?.message || 'Could not close registration.'}`);
        } finally {
            setIsClosing(false);
        }
    };

    return (
        <div className="flex justify-end">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={!isRegistrationOpen || isClosing}>
                        {isClosing ? 'Processing...' : (isRegistrationOpen ? 'Close Registration & Export Lists' : 'Registration Closed')}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently close registration for this event. You will receive two CSV files containing the lists of all approved teams and individuals. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCloseRegistration}>Yes, close registration</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}