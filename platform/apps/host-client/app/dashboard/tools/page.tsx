// apps/host-client/app/dashboard/tools/page.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/app/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 

import axios from 'axios';

const downloadFile = (data: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default function AiToolsPage() {
    const {token} = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs for file inputs
    const model1FileRef = useRef<HTMLInputElement>(null);
    const model2FileRef = useRef<HTMLInputElement>(null);
    const roomsAvailableRef = useRef<HTMLInputElement>(null);
    const roomCapacityRef = useRef<HTMLInputElement>(null);
    const model3FileRef = useRef<HTMLInputElement>(null);
    const [hackathons, setHackathons] = useState<{ id: string, name: string }[]>([]);
    const [selectedHackathon, setSelectedHackathon] = useState<string>('');
    useEffect(() => {
        const fetchHackathons = async () => {
            if (!token) return;
            try {
                // We reuse the endpoint that lists hackathons for the dashboard
                const response = await axios.get('/api/protected/hackathons', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setHackathons(response.data);
            } catch (error) {
                console.error("Failed to fetch hackathons for tool page", error);
            }
        };
        fetchHackathons();
    }, [token]);

    // Handlers are placeholders for now
    const handleModel1Submit = async () => {
        const file = model1FileRef.current?.files?.[0];
        if (!file) {
            setError("Please select the individuals CSV file first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/protected/tools/form-teams', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Send the JWT for authentication
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob', // Expect a file blob in return
            });
            
            // Trigger the download on the client side
            downloadFile(response.data, 'formed-teams-by-id.csv');

        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to generate teams.");
        } finally {
            setIsLoading(false);
        }
    };
    const handleModel2Submit = async () => {
        const file = model2FileRef.current?.files?.[0];
        if (!file || !selectedHackathon) {
            setError("Please select a hackathon and the formed teams CSV file.");
            return;
        }
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('hackathonId', selectedHackathon); // <-- Add hackathonId to form data

        try {
            const response = await axios.post('/api/protected/tools/register-teams', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            alert(response.data.message); // Show success message
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to register teams.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleModel3Submit = async () => {
        const file = model3FileRef.current?.files?.[0];
        const roomsAvailable = roomsAvailableRef.current?.value;
        const roomCapacity = roomCapacityRef.current?.value;

        if (!file || !roomsAvailable || !roomCapacity) {
            setError("Please provide all room details and the approved teams CSV file.");
            return;
        }
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('roomsAvailable', roomsAvailable);
        formData.append('roomCapacity', roomCapacity);

        try {
            const response = await axios.post('/api/protected/tools/allocate-rooms', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob', // Expect a file blob
            });
            
            // We reuse our download helper function
            downloadFile(response.data, 'room-allocations.csv');

        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to generate room allocations.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="p-4 md:p-8">
            <h1 className="text-4xl font-bold mb-8">AI Administrative Tools</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Model 1: AI Team Formation */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Model 1: AI Team Formation</CardTitle>
                        <CardDescription>Upload the `individuals.csv` (with id, profileScore, eligibility) to generate teams.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="model1-file">Individuals CSV File</Label>
                            <Input id="model1-file" type="file" accept=".csv" ref={model1FileRef} />
                        </div>
                        <Button onClick={handleModel1Submit} disabled={isLoading} className="w-full">
                            Generate Formed Teams CSV
                        </Button>
                    </CardContent>
                </Card>

                {/* Model 2: Automatic Team Registration */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Model 2: Auto-Register Teams</CardTitle>
                        <CardDescription>Upload the `formed-teams-by-id.csv` to register these teams in the database.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* --- NEW: Hackathon Selector --- */}
                        <div className="space-y-2">
                            <Label>Select Hackathon</Label>
                            <Select onValueChange={setSelectedHackathon} value={selectedHackathon}>
                                <SelectTrigger><SelectValue placeholder="Choose a hackathon..." /></SelectTrigger>
                                <SelectContent>
                                    {hackathons.map(h => (
                                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem> 
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model2-file">Formed Teams CSV File</Label>
                            <Input id="model2-file" type="file" accept=".csv" ref={model2FileRef} />
                        </div>
                        <Button onClick={handleModel2Submit} disabled={isLoading || !selectedHackathon} className="w-full">
                           {isLoading ? 'Registering...' : 'Register Teams'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Model 3: Room Allocation */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Model 3: Room Allocation</CardTitle>
                        <CardDescription>Provide room details and the approved teams list to get an allocation plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rooms-available">No. of Rooms</Label>
                            <Input id="rooms-available" type="number" placeholder="e.g., 10" ref={roomsAvailableRef} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="room-capacity">Teams per Room</Label>
                            <Input id="room-capacity" type="number" placeholder="e.g., 5" ref={roomCapacityRef} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model3-file">Approved Teams CSV File</Label>
                            <Input id="model3-file" type="file" accept=".csv" ref={model3FileRef} />
                        </div>
                        <Button onClick={handleModel3Submit} disabled={isLoading} className="w-full">
                            Generate Room Allocation CSV
                        </Button>
                    </CardContent>
                </Card>

            </div>
            {error && <p className="mt-4 text-destructive font-semibold">{error}</p>}
        </main>
    );
}