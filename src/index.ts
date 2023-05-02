
export class ShoyoXp {
    private repository: RepositoryInterface;
    private rewardListeners: Function[] = [];
    private levelListeners: Function[] = [];

    constructor(repository: RepositoryInterface) {
        this.repository = repository;
    }

    public addRewardListener(func: Function) {
        this.rewardListeners.push(func);
    }

    public addLevelListener(func: Function) {
        this.levelListeners.push(func);
    }

    public removeRoleReward(guildId: string, level: number, reward: string): void {
        this.repository.removeReward(guildId, level, reward);
    }

    public createRoleReward(guildId: string, level: number, reward: string): void {
        this.repository.addReward(guildId, level, reward);
    }

    private handleRewards(userId: string, guildId: string, level: number): void {
        const rewards = this.repository.getReward(guildId, level);
        rewards.forEach(reward => {
            this.rewardListeners.forEach(listener => {
                listener(userId, guildId, reward);
            })
        })
    }

    private handleLevel(userId: string, guildId: string, level: number): void {
        this.levelListeners.forEach(listener => {
            listener(userId, guildId, level);
        })
    }

    public appendXp(userId: string, guildId: string, xp: number): void {
        if (xp <= 0) {
            throw new TypeError("An amount of xp must be greater than 0")
        }

        const user = this.repository.getUser(userId, guildId);
        user.xp += xp;
        const userLevel = user.level;
        user.level = Math.floor(0.1 * Math.sqrt(user.xp));
        user.lastUpdated = new Date();
        const isLevelChange = user.level != userLevel;
        this.repository.saveUser(user);
        if (isLevelChange) {
            this.handleRewards(userId, guildId, user.level);
        }
    }

    public appendLevel(userId: string, guildId: string, level: number): void {
        if (level <= 0) {
            throw new TypeError("A level must be greater than 0")
        }
        const user = this.repository.getUser(userId, guildId);
        const userLevel = user.level;
        user.level += level;
        user.xp = user.level * user.level * 100;
        user.lastUpdated = new Date();
        const isLevelChange = user.level != userLevel;
        this.repository.saveUser(user);
        if (isLevelChange) {
            this.handleRewards(userId, guildId, user.level);
        }
    }

    public setXp(userId: string, guildId: string, xp: number): void {
        if (xp <= 0) {
            throw new TypeError("An amount of xp must be greater than 0")
        }

        const user = this.repository.getUser(userId, guildId);
        user.xp = xp;
        const userLevel = user.level;
        user.level = Math.floor(0.1 * Math.sqrt(user.xp));
        user.lastUpdated = new Date();
        const isLevelChange = user.level != userLevel;
        this.repository.saveUser(user);
        if (isLevelChange) {
            this.handleRewards(userId, guildId, user.level);
        }
    }

    public setLevel(userId: string, guildId: string, level: number): void {
        if (level <= 0) {
            throw new TypeError("A level must be greater than 0")
        }
        const user = this.repository.getUser(userId, guildId);
        const userLevel = user.level;
        user.level = level;
        user.xp = user.level * user.level * 100;
        user.lastUpdated = new Date();
        const isLevelChange = user.level != userLevel
        this.repository.saveUser(user);
        if (isLevelChange) {
            this.handleRewards(userId, guildId, user.level);
        }
    }

    public static xpForLevel(level: number): number {
        if (level <= 0) {
            throw new RangeError("A level must be greater than 0")
        }
        return level * level * 100;
    }
}

export interface UserInterface {
    userId: string;
    guildId: string;
    xp: number;
    level: number;
    lastUpdated: Date;
}

export interface RewardInterface {
    guildId: string;
    level: number;
    reward: string;
}

export interface RepositoryInterface {
    saveUser(user: UserInterface): void

    getUser(userId: string, guildId: string): UserInterface;

    deleteUser(userId: string, guildId: string): void;

    getRewards(guildId: string): RewardInterface[];

    getReward(guildId: string, level: number): string[];

    addReward(guildId: string, level: number, reward: string): void;

    removeReward(guildId: string, level: number,reward: string): void;

}

import * as path from "path";
import * as fs from "fs";

export class FileRepository implements RepositoryInterface {
    private usersFilePath: string;
    private userFileName = "users.json";
    private rewardsFileName = "rewards.json";
    private rewardsFilePath: string;
    private users: UserInterface[] = [];
    private rewards: RewardInterface[] = [];

    constructor(filePath: string) {
        this.createFilePathIfNotExists(filePath);
        this.usersFilePath = path.join(filePath, this.userFileName);
        this.rewardsFilePath = path.join(filePath, this.rewardsFileName);
        this.loadUsersFile();
        this.loadRewardsFile();
    }

    private createFilePathIfNotExists(filePath: string): void {
        fs.mkdirSync(filePath, {recursive: true});
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

    public removeReward(guildId: string, level: number,rewardID:string): void {
        this.rewards = this.rewards.filter(reward => reward.guildId !== guildId && reward.level !== level && reward.reward !== rewardID);
        this.saveRewardsFile();
    }

}
