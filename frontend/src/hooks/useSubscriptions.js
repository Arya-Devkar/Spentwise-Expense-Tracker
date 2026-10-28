import { useEffect, useState } from "react";
import {
    createSubscription,
    deleteSubscription as apiDelete,
    getSubscriptions,
    updateSubscription as apiUpdate,
} from "../services/subscriptionService";

function useSubscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);

    useEffect(() => {
        let ignore = false;
        getSubscriptions()
            .then((data) => {
                if (!ignore) setSubscriptions(data);
            })
            .catch(() => {
                // the expenses hook already shows a "server unreachable" message
            });
        return () => {
            ignore = true;
        };
    }, []);

    const addSubscription = async (sub) => {
        const created = await createSubscription(sub);
        setSubscriptions((prev) => [created, ...prev]);
        return created;
    };

    const deleteSubscription = async (id) => {
        await apiDelete(id);
        setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    };

    // Pause or resume: send the full object with active flipped
    const toggleSubscription = async (id) => {
        const current = subscriptions.find((s) => s.id === id);
        if (!current) return;
        const { name, amount, billingDay, active } = current;
        const updated = await apiUpdate(id, {
            name,
            amount,
            billingDay,
            active: !active,
        });
        setSubscriptions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    };

    return { subscriptions, addSubscription, deleteSubscription, toggleSubscription };
}

export default useSubscriptions;