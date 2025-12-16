"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@prisma/client";
import { useState } from "react";
import { updateUser } from "@/app/_actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/components/auth/Dropdown";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfileProps {
    user: User;
    isOwnProfile: boolean;
}

export function UserProfile({ user, isOwnProfile }: UserProfileProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [name, setName] = useState(user.name || "");
    const [headline, setHeadline] = useState(user.headline || "");
    const [bio, setBio] = useState(user.bio || "");
    const [website, setWebsite] = useState(user.website || "");

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateUser(user.id, {
                name,
                headline,
                bio,
                website,
            });

            if (result.success) {
                toast({
                    title: "Profile updated",
                    description: "Your profile has been updated successfully.",
                });
                router.refresh();
                setIsEditing(false);
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to update profile",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container max-w-4xl mx-auto py-10">
            <Button
                variant="ghost"
                className="mb-6 pl-0 hover:bg-transparent hover:underline"
                onClick={() => router.push("/presentation")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar / User Info */}
                <div className="w-full md:w-1/3">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={user.image || ""} />
                                    <AvatarFallback className="text-4xl">
                                        {getInitials(user.name || "")}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle>{user.name}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {user.headline && (
                                <p className="text-sm font-medium text-center text-muted-foreground mb-4">
                                    {user.headline}
                                </p>
                            )}
                            {/* Stats or other info could go here */}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content / Edit Form */}
                <div className="w-full md:w-2/3">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>
                                        Manage your public profile information.
                                    </CardDescription>
                                </div>
                                {isOwnProfile && !isEditing && (
                                    <Button onClick={() => setIsEditing(true)} variant="outline">
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="headline">Headline</Label>
                                <Input
                                    id="headline"
                                    placeholder="Software Engineer at Company"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Tell us about yourself"
                                    className="min-h-[100px]"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    placeholder="https://example.com"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                        </CardContent>
                        {isEditing && (
                            <CardFooter className="flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsEditing(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
