import { useEffect, useState } from "react";
import {
    getSubscriptions,
    saveSubscriptions,
} from "../services/subscriptionService";

function useSubscriptions() {
    const [subscriptions, setSubscriptions] = useState(getSubscriptions);

    useEffect(() => {
        saveSubscriptions(subscriptions);
    }, [subscriptions]);

    const addSubscription = (sub) =>
        setSubscriptions((prev) => [sub, ...prev]);

    const deleteSubscription = (id) =>
        setSubscriptions((prev) => prev.filter((s) => s.id !== id));

    // The "update" in CRUD: pause or resume
    const toggleSubscription = (id) =>
        setSubscriptions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
        );

    return {
        subscriptions,
        addSubscription,
        deleteSubscription,
        toggleSubscription,
    };
}

export default useSubscriptions;