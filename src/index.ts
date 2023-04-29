import {RepositoryInterface} from "./RepositoryInterface";

export class ShoyoXp {
    private repository: RepositoryInterface;
    private rewardListeners: Function[] = [];

    constructor(repository: RepositoryInterface) {
        this.repository = repository;
    }

    public addRewardListener(func: Function) {
        this.rewardListeners.push(func);
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

    public appendXp(userId: string, guildId: string, xp: number): void {
        if (xp <= 0) {
            throw new TypeError("An amount of xp must be greater than 0")
        }

        const user = this.repository.getUser(userId, guildId);
        user.xp += xp;
        user.level = Math.floor(0.1 * Math.sqrt(user.xp));
        user.lastUpdated = new Date();
        const isLevelChange = user.level != this.repository.getUser(userId, guildId).level;
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
        user.level += level;
        user.xp = user.level * user.level * 100;
        user.lastUpdated = new Date();
        const isLevelChange = user.level != this.repository.getUser(userId, guildId).level;
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
        user.level = Math.floor(0.1 * Math.sqrt(user.xp));
        user.lastUpdated = new Date();
        const isLevelChange = user.level != this.repository.getUser(userId, guildId).level;
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
        user.level = level;
        user.xp = user.level * user.level * 100;
        user.lastUpdated = new Date();
        const isLevelChange = user.level != this.repository.getUser(userId, guildId).level;
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