import {UserInterface} from "./UserInterface";
import {RewardInterface} from "./RewardInterface";

export interface RepositoryInterface {
    saveUser(user: UserInterface): void

    getUser(userId: string, guildId: string): UserInterface;

    deleteUser(userId: string, guildId: string): void;

    getRewards(guildId: string): RewardInterface[];

    getReward(guildId: string, level: number): string[];

    addReward(guildId: string, level: number, reward: string): void;

    removeReward(guildId: string, level: number): void;

}

