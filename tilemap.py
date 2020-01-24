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
        self.empty_tiles = []
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
                elif self.tilemap[j][k] == Tile.EMPTY:
                    self.empty_tiles.append([j,k])
                k += 1
            j += 1

    # returns wall to be sent to client
    def getTileMapInfo(self):
        return {"w":self.gridwidth, "h":self.gridheight, "c":self.cellwidth}

    def getWalls(self):
        return self.walls_send
    
    def wallCollision(self, hitbox):
        left_tile = floor(hitbox.left / self.cellwidth)
        right_tile = floor( hitbox.right / self.cellwidth)
        top_tile = floor( hitbox.top / self.cellwidth)
        bottom_tile =  floor(hitbox.bottom / self.cellwidth)

        # print(f"{left_tile},{right_tile},{top_tile},{bottom_tile}")

        # returns True (yes collision) if you end up outside the bounds of the map
        if(left_tile < 0):
            return True
            #left_tile = 0
        if(right_tile >= self.gridwidth):
            return True
            # right_tile = self.gridwidth - 1
        if(top_tile < 0):
            return True
            # top_tile = 0
        if(bottom_tile >= self.gridheight):
            return True
            # bottom_tile = self.gridheight - 1

        i = left_tile;
        while(i <= right_tile):
            j = top_tile
            while(j <= bottom_tile):
                if(self.tilemap[i][j] == Tile.WALL):
                    # print("WALL COLLISION")
                    return True
                j += 1
            i += 1
        return False


    def getOpenCoords(self):
        gridspot = random.choice(self.empty_tiles)

        return [((i * self.cellwidth) + (self.cellwidth/2)) for i in gridspot]