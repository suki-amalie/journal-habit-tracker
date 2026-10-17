import { useState } from "react";
import { useState, useQuery, useQueryClient } from "@tanstack/react-query"

import {
    createCapsule,
    deleteCapsule,
    getCapsule,
    type Status,
} from "../services/timerService.ts";
import type { Capsule } from "../types/capsule;
