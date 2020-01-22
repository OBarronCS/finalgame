# holds tile map of walls
# defines world dimensions

import enum 
from math import floor
import random
# creating enumerations using class 
class Tile(enum.Enum): 
    EMPTY = 0
    WALL = 1


class TileMap:
    def __init__(self, width, height, cellwidth):
        self.width = width
        self.height = height
        self.cellwidth = cellwidth

        self.gridwidth = floor(width/cellwidth)
        self.gridheight = floor(height/cellwidth)

        self.tilemap = [[Tile.EMPTY for x in range(self.gridwidth)] for y in range(self.gridheight)]
        self.walls_send = []
        self.addWalls()
        
    # temporary
    def addWalls(self):

        i = 0
        while(i < 1000):
            if(random.random() > .4):
                self.tilemap[floor(random.random() * self.gridheight)][floor(random.random() * self.gridwidth)] = Tile.WALL

            i += 1;

        j = 0
        while(j < self.gridheight):
            k = 0
            while(k < self.gridwidth):
                if self.tilemap[j][k] == Tile.WALL:
                    self.walls_send.append([j,k])
                k += 1
            j += 1

    # returns wall to be sent to client
    def getTileMapInfo(self):
        return {"w":self.gridwidth, "h":self.gridheight, "c":self.cellwidth}

    def getWalls(self):
        return self.walls_send
    