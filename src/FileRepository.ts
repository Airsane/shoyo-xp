import {RepositoryInterface} from "./RepositoryInterface";
import {UserInterface} from "./UserInterface";
import * as path from "path";
import * as fs from "fs";
import {RewardInterface} from "./RewardInterface";

export class FileRepository implements RepositoryInterface {
    private usersFilePath: string;
    private userFileName = "users.json";
    private rewardsFileName = "rewards.json";
    private rewardsFilePath: string;
    private users: UserInterface[] = [];
    private rewards: RewardInterface[] = [];

    constructor(filePath: string) {
        this.usersFilePath = path.join(filePath, this.userFileName);
        this.rewardsFilePath = path.join(filePath, this.rewardsFileName);
        this.loadUsersFile();
        this.loadRewardsFile();
    }

    public deleteUser(userId: string, guildId: string): void {
        this.users = this.users.filter(user => user.userId !== userId && user.guildId !== guildId);
        this.saveUsersFile();
    }

    public getUser(userId: string, guildId: string): UserInterface {
        const user = this.users.find(user => user.userId === userId && user.guildId === guildId);
        if (user) {
            return user;
        }
        const newUser: UserInterface = {
            userId: userId,
            guildId: guildId,
            xp: 0,
            level: 0,
            lastUpdated: new Date()
        }
        this.users.push(newUser);
        return newUser;
    }

    private loadUsersFile(): void {
        if (!fs.existsSync(this.usersFilePath)) {
            fs.writeFileSync(this.usersFilePath, JSON.stringify(this.users));
        } else {
            const data = fs.readFileSync(this.usersFilePath, "utf8");
            this.users = JSON.parse(data);
        }
    }

    private saveUsersFile(): void {
        fs.writeFileSync(this.usersFilePath, JSON.stringify(this.users));
    }

    private loadRewardsFile(): void {
        if (!fs.existsSync(this.rewardsFilePath)) {
            fs.writeFileSync(this.rewardsFilePath, JSON.stringify(this.rewards));
        } else {
            const data = fs.readFileSync(this.rewardsFilePath, "utf8");
            this.rewards = JSON.parse(data);
        }
    }

    private saveRewardsFile(): void {
        fs.writeFileSync(this.rewardsFilePath, JSON.stringify(this.rewards));
    }

    saveUser(user: UserInterface): void {
        this.saveUsersFile();
    }

    addReward(guildId: string, level: number, reward: string): void {
        this.rewards.push({
            guildId: guildId,
            level: level,
            reward: reward
        });
        this.saveRewardsFile();
    }

    public getReward(guildId: string, level: number): string[] {
        return this.rewards.filter(reward => reward.guildId === guildId && reward.level === level).map(reward => reward.reward);
    }

    public getRewards(guildId: string): RewardInterface[] {
        return this.rewards.filter(reward => reward.guildId === guildId);
    }

    public removeReward(guildId: string, level: number): void {
        this.rewards = this.rewards.filter(reward => reward.guildId !== guildId && reward.level !== level);
        this.saveRewardsFile();
    }

}