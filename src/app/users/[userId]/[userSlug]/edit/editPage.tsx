import { useAuthStore, UserPreferences } from "@/ZustandStore/Auth";
import React from "react";

const PageEdit = async () => {
    const user=useAuthStore(state=> state.user)
    // const userget=await users.get<UserPreferences>(user?.$id)
    return (
        <div className="container mx-auto space-y-4 px-4 pb-20 pt-32">
            <h1>Edit</h1>
            <h2>Homework</h2>
        </div>
    );
};

export default PageEdit;
