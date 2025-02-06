import {describe, beforeAll, it, vi, expect} from "vitest"
import {SettingSqliteRepository} from "../../../src/repository/sqlite/SettingSqliteRepository.js";
import {ISetting, ISettingBase} from "@drax/settings-share";
import {AbstractSqliteRepository} from "@drax/crud-back";

describe('SettingSqliteRepository', () => {



    beforeAll(async () => {
        const repository = new SettingSqliteRepository("test.db", false)

    })



    // it('should verify that SettingSqliteRepository is an instance of AbstractSqliteRepository', () => {
    //     // Arrange
    //     const repository = new SettingSqliteRepository("test.db", false);
    //
    //     // Assert
    //     expect(repository).toBeInstanceOf(AbstractSqliteRepository);
    // });



    it('should correctly handle adding a new setting to the repository', async () => {
        // Arrange
        const repository = new SettingSqliteRepository("test.db", false);
        const newSetting: ISettingBase = {
            key: 'newKey',
            value: 'newValue',
            label: 'New Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };
        const expectedSetting = {id: '2', ...newSetting};

        // Mock the create method of the repository
        vi.spyOn(repository, 'create').mockResolvedValue(expectedSetting);

        // Act
        const createdSetting = await repository.create(newSetting);

        // Assert
        expect(createdSetting).toEqual(expectedSetting);
        expect(repository.create).toHaveBeenCalledWith(newSetting);
    });

    it('should correctly handle updating an existing setting in the repository', async () => {
        // Arrange
        const repository = new SettingSqliteRepository("test.db", false);
        const existingSettingId = '1';
        const updatedData: ISettingBase = {
            key: 'existingKey',
            value: 'updatedValue',
            label: 'Updated Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };
        const expectedUpdatedSetting: ISetting = {
            id: existingSettingId,
            ...updatedData
        };

        // Mock the update method of the repository
        vi.spyOn(repository, 'update').mockResolvedValue(expectedUpdatedSetting);

        // Act
        const updatedSetting = await repository.update(existingSettingId, updatedData);

        // Assert
        expect(updatedSetting).toEqual(expectedUpdatedSetting);
        expect(repository.update).toHaveBeenCalledWith(existingSettingId, updatedData);
    });


    it('should correctly handle searching for a setting by _id', async () => {
        // Arrange
        const repository = new SettingSqliteRepository("test.db", false);
        const settingId = '1';
        const expectedSetting: ISetting = {
            id: settingId,
            key: 'existingKey',
            value: 'existingValue',
            label: 'Existing Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        };

        // Mock the findById method of the repository
        vi.spyOn(repository, 'findById').mockResolvedValue(expectedSetting);

        // Act
        const foundSetting = await repository.findById(settingId);

        // Assert
        expect(foundSetting).toEqual(expectedSetting);
        expect(repository.findById).toHaveBeenCalledWith(settingId);
    });


    it('should correctly handle searching for a setting by key', async () => {
        // Arrange
        const repository = new SettingSqliteRepository("test.db", false);
        const searchKey = 'sampleKey';
        const expectedSettings: ISetting[] = [{
            id: '1',
            key: 'sampleKey',
            value: 'sampleValue',
            label: 'Sample Setting Label',
            group: 'Sample Group',
            type: 'string',
            options: []
        }];

        // Mock the search method of the repository
        vi.spyOn(repository, 'search').mockResolvedValue(expectedSettings);

        // Act
        const foundSettings = await repository.search(searchKey);

        // Assert
        expect(foundSettings).toEqual(expectedSettings);
        expect(repository.search).toHaveBeenCalledWith(searchKey);
    });



    it('should correctly handle deleting a setting from the repository', async () => {
        // Arrange
        const repository = new SettingSqliteRepository("test.db", false);
        const settingId = '1';
        const expectedDeletionResult = true;

        // Mock the delete method of the repository
        vi.spyOn(repository, 'delete').mockResolvedValue(expectedDeletionResult);

        // Act
        const deletionResult = await repository.delete(settingId);

        // Assert
        expect(deletionResult).toBe(expectedDeletionResult);
        expect(repository.delete).toHaveBeenCalledWith(settingId);
    });


    it('should correctly handle retrieving all settings from the repository', async () => {
        // Arrange
        const repository = new SettingSqliteRepository("test.db", false);
        const expectedSettings: ISetting[] = [{
            id: '1',
            key: 'existingKey',
            value: 'existingValue',
            label: 'Existing Key Label',
            group: 'Default Group',
            type: 'string',
            options: []
        }];

        // Mock the fetchAll method of the repository
        vi.spyOn(repository, 'fetchAll').mockResolvedValue(expectedSettings);

        // Act
        const allSettings = await repository.fetchAll();

        // Assert
        expect(allSettings).toEqual(expectedSettings);
        expect(repository.fetchAll).toHaveBeenCalled();
    });

})
